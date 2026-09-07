/* The sentences the component actually builds, driven through both
   dictionaries without React: the same `t` walk the provider does, real
   results from the advice functions, and the rule that units are frozen at
   ask time. */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import en from "../i18n/en.js";
import es from "../i18n/es.js";
import { adviseSize, adviseYarn, adviseGauge, adviseRows, sizeTable } from "./advice.js";
import { said, sizeText, yarnText, gaugeText, rowText, signed, tableNote, tableLine, adviceAsText } from "./words.js";

const DICTS = { en, es };
const makeT = (dict) => (key, params) => {
  const val = key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), dict);
  if (val === undefined) throw new Error(`no entry for ${key}`);
  return typeof val === "function" ? val(params || {}) : val;
};

const SIZES = [32, 36, 40, 44, 48, 52];
const YARDS = [900, 1000, 1100, 1250, 1400, 1550];

/* A tight knitter with a shortish basket, asked in inches: every card has
   something to say and the table reaches every verdict. */
const results = (inch = true) => {
  const size = adviseSize({ sizes: SIZES, bust: 38, ease: 2, patternGauge: 18, myGauge: 21, closeGap: 1 });
  const stash = { perSkein: 220, skeins: 5, patternGauge: 18, myGauge: 21 };
  return {
    error: false,
    inch,
    bust: 38,
    easeIdx: 2,
    size,
    yarn: adviseYarn({ yards: YARDS, sizes: SIZES, bestIdx: size.bestIdx, ...stash }),
    gauge: adviseGauge({ patternGauge: 18, myGauge: 21, best: size.best }),
    row: adviseRows({ patternRowGauge: 24, myRowGauge: 26, swatchSpan: 4 }),
    table: sizeTable({ sizes: SIZES, yards: YARDS, bust: 38, ease: 2, ...stash, bestIdx: size.bestIdx, runnerUp: size.runnerUp }),
  };
};

const clean = (text, where) => {
  assert.equal(typeof text, "string", where);
  assert.ok(text.length > 20, `${where}: ${text}`);
  for (const ghost of ["undefined", "NaN", "[object Object]"]) assert.ok(!text.includes(ghost), `${where} leaked ${ghost}: ${text}`);
};

for (const lang of ["en", "es"]) {
  const t = makeT(DICTS[lang]);
  describe(`${lang}: the cards, as sentences`, () => {
    const r = results();

    test("units are the ones Nana was asked in, not the live toggle", () => {
      assert.equal(said(t, r).lenU, "in");
      assert.equal(said(t, results(false)).lenU, "cm");
      assert.equal(said(t, results(false)).yarnU, "m");
    });

    test("the size card names the size and, when adjusted, what it comes out to", () => {
      const text = sizeText(t, r);
      clean(text, `${lang} size`);
      assert.ok(text.includes("48") && text.includes(String(r.size.actual)), text);
    });

    test("the yarn card shows its gauge working", () => {
      const text = yarnText(t, r);
      clean(text, `${lang} yarn`);
      assert.ok(r.yarn.gaugeAdjusted);
      assert.ok(text.includes(String(r.yarn.patternNeed)) && text.includes(String(r.yarn.need)), text);
    });

    test("the tension card speaks of needles for knitting and hooks for crochet", () => {
      const knit = gaugeText(t, r, "knit");
      const crochet = gaugeText(t, r, "crochet");
      clean(knit, `${lang} gauge`);
      assert.notEqual(knit, crochet);
    });

    test("the length card", () => clean(rowText(t, r), `${lang} row`));

    test("the table's note and lines", () => {
      clean(tableNote(t, r), `${lang} note`);
      const lines = r.table.rows.map((row) => tableLine(t, r, row));
      assert.equal(lines.length, 6);
      lines.forEach((l) => assert.ok(l.includes(" · ") && l.includes(" in"), l));
      const pick = lines[r.size.bestIdx];
      assert.ok(pick.endsWith(t("table.pick")), pick);
    });

    test("the copied advice carries every card and the whole table", () => {
      const text = adviceAsText(t, r, "knit", t("proverbs.knit")[0]);
      clean(text, `${lang} copy`);
      for (const key of ["advice.size", "advice.yarn", "advice.tension", "advice.length", "table.title"]) {
        assert.ok(text.includes(t(key)), `copied text is missing ${key}`);
      }
      assert.equal(text.split("\n").filter((l) => l.includes(" · ")).length, 6);
      assert.ok(!/\n{3,}/.test(text), "no triple blank lines");
    });
  });
}

describe("signed", () => {
  test("a plus for roomier, a bare minus for snugger, and never -0", () => {
    assert.equal(signed(1.1), "+1.1");
    assert.equal(signed(-2.3), "-2.3");
    assert.equal(signed(-0), "0");
    assert.equal(signed(0), "0");
  });
});
