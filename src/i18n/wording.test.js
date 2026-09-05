/* Does Nana actually have words for everything she can work out?
   ---------------------------------------------------------------------------
   advice.js returns a `kind` and some numbers; the component turns that into a
   sentence at render time by looking up `result.<card>.<kind>`. That indirection
   is what lets advice re-word itself when the visitor switches language, but it
   also means a missing or stale dictionary entry cannot be caught by the
   compiler — it shows up as the raw key, or the word "undefined", sitting in the
   middle of Nana's advice on the live site.

   So: drive every branch of every advice function, render it through both
   dictionaries exactly as the component does, and insist the result is a real
   sentence. */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import en from "./en.js";
import es from "./es.js";
import { adviseSize, adviseYarn, adviseGauge, adviseRows, sizeTable } from "../lib/advice.js";
import { swatchToGauge, gramsToSkeins } from "../lib/parse.js";

const DICTS = { en, es };

/* The same walk the provider does, minus React. */
const lookup = (dict, key) =>
  key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), dict);

/* Deliberately stricter than the app's `t`: no falling back to English, so a
   missing Spanish key fails here instead of silently shipping in English. */
function say(lang, key, params) {
  const val = lookup(DICTS[lang], key);
  assert.notEqual(val, undefined, `${lang} has no entry for "${key}"`);
  return typeof val === "function" ? val(params || {}) : val;
}

/* A sentence is suspect if it is empty, or if a parameter the dictionary
   expected never arrived. "undefined" and "NaN" reach the page as literal text. */
function assertSentence(text, where) {
  assert.equal(typeof text, "string", `${where} did not produce a string`);
  assert.ok(text.trim().length > 10, `${where} produced almost nothing: ${text}`);
  for (const ghost of ["undefined", "NaN", "[object Object]"]) {
    assert.ok(!text.includes(ghost), `${where} leaked "${ghost}": ${text}`);
  }
}

const LANGS = ["en", "es"];
const SIZES = [32, 36, 40, 44, 48, 52];
const YARDS = [900, 1000, 1100, 1250, 1400, 1550];
const UNITS = { lenU: "in", yarnU: "yds", gaugeLabel: "stitches per 4 in", rowGaugeLabel: "rows per 4 in" };

for (const lang of LANGS) {
  describe(`${lang}: every advice branch has words`, () => {
    /* ---------- the size card ---------- */
    test("size, plain and gauge-adjusted, with and without a runner-up", () => {
      const cases = {
        plain: adviseSize({ sizes: SIZES, bust: 38, ease: 2, patternGauge: null, myGauge: null, closeGap: 1 }),
        adjusted: adviseSize({ sizes: SIZES, bust: 38, ease: 2, patternGauge: 18, myGauge: 21, closeGap: 1 }),
        runnerUp: adviseSize({ sizes: [36, 40], bust: 38, ease: 0, patternGauge: null, myGauge: null, closeGap: 1 }),
      };
      for (const [name, s] of Object.entries(cases)) {
        const key = s.gaugeAdjusted && s.actual !== s.best ? "result.size.mainAdjusted" : "result.size.main";
        let text = say(lang, key, {
          best: s.best,
          actual: s.actual,
          lenU: UNITS.lenU,
          b: 38,
          easeLabel: say(lang, "ease.labels", { inch: true })[2].toLowerCase(),
          target: s.target,
        });
        if (s.runnerUp !== null) text += say(lang, "result.size.runnerUp", { runnerUp: s.runnerUp });
        assertSentence(text, `${lang} size/${name}`);
      }
      /* The adjusted case must actually be reached, or this test proves nothing. */
      assert.ok(cases.adjusted.gaugeAdjusted && cases.adjusted.actual !== cases.adjusted.best);
      assert.notEqual(cases.runnerUp.runnerUp, null);
    });

    /* ---------- the yarn card ---------- */
    const yarnCases = {
      needSizes: { yards: [] },
      listShort: { yards: [900, 1000] },
      askBasket: { perSkein: null, skeins: null },
      allSet: {},
      justCovers: { perSkein: 230, skeins: 5 },
      short: { skeins: 4 },
    };
    for (const [expected, over] of Object.entries(yarnCases)) {
      test(`yarn: ${expected}`, () => {
        const y = adviseYarn({ yards: YARDS, sizes: SIZES, bestIdx: 2, perSkein: 220, skeins: 6, ...over });
        assert.equal(y.kind, expected, "the fixture no longer produces the branch it names");
        const text = say(lang, `result.yarn.${y.kind}`, { ...y, best: 40, yarnU: UNITS.yarnU });
        assertSentence(text, `${lang} yarn/${y.kind}`);
      });
    }

    test("yarn: the mismatch postscript", () => {
      const y = adviseYarn({ yards: [900, 1000, 1100], sizes: SIZES, bestIdx: 2, perSkein: 220, skeins: 6 });
      assert.equal(y.mismatch, true);
      const text = say(lang, `result.yarn.${y.kind}`, { ...y, best: 40, yarnU: UNITS.yarnU })
        + say(lang, "result.yarn.mismatch");
      assertSentence(text, `${lang} yarn/mismatch`);
    });

    /* ---------- the tension card ---------- */
    const gaugeCases = {
      askPattern: { patternGauge: null, myGauge: 18 },
      askYours: { patternGauge: 18, myGauge: null },
      match: { patternGauge: 18, myGauge: 18 },
      off: { patternGauge: 18, myGauge: 21 },
    };
    for (const [expected, args] of Object.entries(gaugeCases)) {
      for (const craft of ["knit", "crochet"]) {
        test(`gauge: ${expected} (${craft})`, () => {
          const g = adviseGauge({ ...args, best: 40 });
          assert.equal(g.kind, expected);
          const text = say(lang, `result.gauge.${g.kind}`, { ...g, ...UNITS, craft });
          assertSentence(text, `${lang} gauge/${g.kind}/${craft}`);
        });
      }
    }

    test("gauge: a looser knitter is told to go the other way", () => {
      const g = adviseGauge({ patternGauge: 18, myGauge: 16, best: 40 });
      assert.equal(g.tighter, false);
      assertSentence(say(lang, "result.gauge.off", { ...g, ...UNITS, craft: "knit" }), `${lang} gauge/looser`);
    });

    test("gauge: one tool size reads as words, not as the number 1", () => {
      /* "go up 1 sizes" is the sort of thing that makes an app feel unloved. */
      const g = adviseGauge({ patternGauge: 18, myGauge: 20, best: 40 });
      assert.equal(g.toolSizes, 1);
      const text = say(lang, "result.gauge.off", { ...g, ...UNITS, craft: "knit" });
      assert.ok(!/\b1 (sizes|tallas|números)\b/.test(text), `reads awkwardly: ${text}`);
    });

    /* ---------- the length card ---------- */
    const rowCases = {
      askPattern: { patternRowGauge: null, myRowGauge: 26 },
      askYours: { patternRowGauge: 24, myRowGauge: null },
      match: { patternRowGauge: 24, myRowGauge: 24 },
      off: { patternRowGauge: 24, myRowGauge: 26 },
    };
    for (const [expected, args] of Object.entries(rowCases)) {
      test(`rows: ${expected}`, () => {
        const r = adviseRows({ ...args, swatchSpan: 4 });
        assert.equal(r.kind, expected);
        assertSentence(say(lang, `result.row.${r.kind}`, { ...r, ...UNITS }), `${lang} row/${r.kind}`);
      });
    }

    /* ---------- the all-sizes table ---------- */
    test("the size table: headers, badges and every basket verdict", () => {
      /* A basket sized so the table produces all three verdicts at once —
         against the yardage as scaled for a 21-against-18 knitter, which is
         what the table now shows. */
      const tbl = sizeTable({
        sizes: SIZES, yards: YARDS, bust: 38, ease: 2,
        patternGauge: 18, myGauge: 21, perSkein: 220, skeins: 5,
        bestIdx: 4, runnerUp: 44,
      });
      assert.ok(tbl.gaugeAdjusted && tbl.hasVerdicts, "the fixture went quiet");
      const seen = new Set(tbl.rows.map((r) => r.stash));
      for (const kind of ["plenty", "justEnough", "short"]) {
        assert.ok(seen.has(kind), `the fixture no longer reaches ${kind}`);
      }

      const headers = [
        say(lang, "table.title"),
        say(lang, "table.caption"),
        say(lang, "table.size", { lenU: UNITS.lenU }),
        say(lang, "table.comesOut", { lenU: UNITS.lenU }),
        say(lang, "table.vsAim", { target: tbl.target, lenU: UNITS.lenU }),
        say(lang, "table.yarn", { yarnU: UNITS.yarnU }),
        say(lang, "table.basket"),
      ].join(" ");
      assertSentence(headers, `${lang} table/headers`);

      /* Verdicts and badges are cell-sized, so judge them joined together. */
      const cells = tbl.rows
        .filter((r) => r.stash)
        .map((r) => say(lang, `table.${r.stash}`, { shortAmt: r.shortAmt, yarnU: UNITS.yarnU }))
        .concat(say(lang, "table.pick"), say(lang, "table.closeCall"))
        .join(" · ");
      assertSentence(cells, `${lang} table/cells`);

      assertSentence(
        say(lang, "table.note", { gaugeAdjusted: true, hasVerdicts: true }),
        `${lang} table/note`
      );
      /* With nothing to explain, the note must vanish rather than mumble. */
      assert.equal(say(lang, "table.note", { gaugeAdjusted: false, hasVerdicts: false }), "");
    });

    /* ---------- the frame around the cards ---------- */
    test("the introduction, and the proverbs it draws on", () => {
      for (const craft of ["knit", "crochet"]) {
        const list = say(lang, `proverbs.${craft}`);
        assert.ok(Array.isArray(list) && list.length > 0, `${lang} has no ${craft} proverbs`);
        for (const proverb of list) {
          assertSentence(say(lang, "result.intro", { proverb }), `${lang} intro/${craft}`);
        }
      }
    });

    test("the parse echo, for each thing the parser might have assumed", () => {
      const text = say(lang, "echo.read", { list: "32, 36, 40" })
        + say(lang, "echo.range")
        + say(lang, "echo.thousands")
        + say(lang, "echo.fraction");
      assertSentence(text, `${lang} echo`);
    });

    /* ---------- labels, which change with the unit toggle ---------- */
    test("field labels read correctly in both unit systems", () => {
      for (const inch of [true, false]) {
        const gaugeLabel = say(lang, "label.gaugeLabel", { inch });
        const rowGaugeLabel = say(lang, "label.rowGaugeLabel", { inch });
        const lenU = inch ? "in" : "cm";
        const yarnU = inch ? "yds" : "m";
        const fields = {
          "field.patternGauge": { gaugeLabel },
          "field.patternRowGauge": { rowGaugeLabel },
          "field.finishedSizes": { lenU },
          "field.yarnNeeded": { yarnU },
          "field.bust": { lenU },
          "field.swatchGauge": { gaugeLabel },
          "field.swatchRowGauge": { rowGaugeLabel },
          "field.perSkein": { yarnU },
        };
        for (const [key, params] of Object.entries(fields)) {
          const text = say(lang, key, params);
          assert.ok(text.length > 3, `${lang} ${key} is too short: ${text}`);
          for (const ghost of ["undefined", "NaN"]) {
            assert.ok(!text.includes(ghost), `${lang} ${key} leaked "${ghost}": ${text}`);
          }
        }
        const eases = say(lang, "ease.labels", { inch });
        assert.equal(eases.length, 5);
        eases.forEach((label, i) => assert.ok(label.length > 2, `${lang} ease ${i} is bare`));
        const ph = say(lang, "ph", { inch });
        for (const [k, v] of Object.entries(ph)) {
          assert.ok(typeof v === "string" && v.length > 0, `${lang} placeholder ${k} is empty`);
        }
      }
    });
  });
}

describe("the two dictionaries stay level with each other", () => {
  /* Function or string, the shape has to match: a key that is a plain string in
     one language and a function in the other will drop its numbers on the floor
     rather than fail loudly. */
  const shape = (o, prefix = "") =>
    Object.entries(o).flatMap(([k, v]) =>
      v && typeof v === "object" && !Array.isArray(v)
        ? shape(v, `${prefix}${k}.`)
        : [[`${prefix}${k}`, Array.isArray(v) ? "array" : typeof v]]
    );

  const enShape = new Map(shape(en));
  const esShape = new Map(shape(es));

  test("English has nothing Spanish is missing", () => {
    const missing = [...enShape.keys()].filter((k) => !esShape.has(k));
    assert.deepEqual(missing, []);
  });

  test("Spanish has nothing English is missing", () => {
    const missing = [...esShape.keys()].filter((k) => !enShape.has(k));
    assert.deepEqual(missing, []);
  });

  test("matching keys are the same kind of thing in both", () => {
    const wrong = [...enShape.entries()]
      .filter(([k, kind]) => esShape.has(k) && esShape.get(k) !== kind)
      .map(([k, kind]) => `${k}: en ${kind}, es ${esShape.get(k)}`);
    assert.deepEqual(wrong, []);
  });
});

/* ---------- the swatch helper ----------
   Not advice, but the same trap: a computed number dropped into a sentence
   from the dictionary, in whichever language is showing. */
for (const lang of LANGS) {
  describe(`${lang}: the swatch helper has words`, () => {
    test("intro, both results, the confirmation, the tip, and every label", () => {
      const sts = swatchToGauge("22", "4.25", 4);
      const rows = swatchToGauge("30", "4.5", 4);
      assert.equal(sts, 20.7);
      assertSentence(say(lang, "swatch.intro", { spanLabel: "4 in" }), `${lang} swatch/intro`);
      assertSentence(say(lang, "swatch.stitchesOut", { gauge: sts, gaugeLabel: UNITS.gaugeLabel }), `${lang} swatch/stitchesOut`);
      assertSentence(say(lang, "swatch.rowsOut", { gauge: rows, rowGaugeLabel: UNITS.rowGaugeLabel }), `${lang} swatch/rowsOut`);
      assertSentence(say(lang, "swatch.used"), `${lang} swatch/used`);
      assertSentence(say(lang, "swatch.tip"), `${lang} swatch/tip`);
      for (const key of ["summary", "stitches", "rows", "use"]) {
        assert.ok(say(lang, `swatch.${key}`).length > 3, `${lang} swatch/${key} is too short to be a label`);
      }
      /* The width labels carry the unit, like every other field label. */
      assert.ok(say(lang, "swatch.across", { lenU: "in" }).includes("(in)"));
      assert.ok(say(lang, "swatch.tall", { lenU: "cm" }).includes("(cm)"));
      const ph = say(lang, "ph", { inch: false });
      for (const key of ["swatchStitches", "swatchAcross", "swatchRows", "swatchTall"]) {
        assert.ok(ph[key], `${lang} ph.${key} is missing`);
      }
    });
  });
}

/* ---------- yardage scaled for gauge ---------- */
for (const lang of LANGS) {
  describe(`${lang}: the gauge postscript on the yarn card`, () => {
    test("tight and loose, on a kind that quotes the figure", () => {
      for (const myGauge of [21, 16]) {
        const y = adviseYarn({ yards: YARDS, sizes: SIZES, bestIdx: 4, perSkein: 220, skeins: 7, patternGauge: 18, myGauge });
        assert.equal(y.gaugeAdjusted, true, "the fixture did not adjust");
        const text =
          say(lang, `result.yarn.${y.kind}`, { ...y, best: 48, yarnU: UNITS.yarnU }) +
          say(lang, "result.yarn.adjusted", { ...y, yarnU: UNITS.yarnU });
        assertSentence(text, `${lang} yarn/adjusted/${myGauge}`);
        /* Both figures must appear, or the postscript is not showing its working. */
        assert.ok(text.includes(String(y.patternNeed)) && text.includes(String(y.need)), text);
      }
    });

    test("the table note mentions the yarn column only when it was scaled", () => {
      const scaled = say(lang, "table.note", { gaugeAdjusted: true, hasVerdicts: true, yarnAdjusted: true });
      const plain = say(lang, "table.note", { gaugeAdjusted: true, hasVerdicts: true, yarnAdjusted: false });
      assertSentence(scaled, `${lang} table/note/scaled`);
      assert.ok(scaled.length > plain.length && scaled.startsWith(plain.split(" ")[0]));
    });
  });
}

/* ---------- the weighing helper ---------- */
for (const lang of LANGS) {
  describe(`${lang}: the weighing helper has words`, () => {
    test("intro, the result with and without yardage, one skein, the confirmation, the tip", () => {
      const skeins = gramsToSkeins("350", "100");
      assert.equal(skeins, 3.5);
      assertSentence(say(lang, "weigh.intro"), `${lang} weigh/intro`);
      assertSentence(say(lang, "weigh.out", { skeins, yards: 770, yarnU: UNITS.yarnU }), `${lang} weigh/out`);
      assertSentence(say(lang, "weigh.out", { skeins, yards: null, yarnU: UNITS.yarnU }), `${lang} weigh/out/noYards`);
      /* "1 skeins' worth" is the sort of thing that makes an app feel unloved. */
      const one = say(lang, "weigh.out", { skeins: 1, yards: null, yarnU: UNITS.yarnU });
      assert.ok(!/\b1 /.test(one), `one skein should read as words: ${one}`);
      assertSentence(say(lang, "weigh.used"), `${lang} weigh/used`);
      assertSentence(say(lang, "weigh.tip"), `${lang} weigh/tip`);
      for (const key of ["summary", "use"]) assert.ok(say(lang, `weigh.${key}`).length > 3);
      assert.ok(say(lang, "weigh.skeinWeighs").includes("(g)") && say(lang, "weigh.haveWeighs").includes("(g)"));
      const ph = say(lang, "ph", { inch: true });
      assert.ok(ph.weighSkein && ph.weighHave, `${lang} ph.weigh* missing`);
    });
  });
}
