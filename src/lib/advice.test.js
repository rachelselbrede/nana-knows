import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { adviseSize, adviseYarn, adviseGauge, adviseRows, sizeTable } from "./advice.js";
import { r1 } from "./parse.js";

/* A common worsted sweater pattern, in inches. */
const SIZES = [32, 36, 40, 44, 48, 52];
const YARDS = [900, 1000, 1100, 1250, 1400, 1550];
const CLOSE = 1;

const size = (over) =>
  adviseSize({
    sizes: SIZES,
    bust: 38,
    ease: 2,
    patternGauge: null,
    myGauge: null,
    closeGap: CLOSE,
    ...over,
  });

describe("adviseSize: without a personal gauge", () => {
  test("picks the size nearest bust plus ease", () => {
    const r = size();
    assert.equal(r.target, 40);
    assert.equal(r.best, 40);
    assert.equal(r.bestIdx, 2);
  });

  test("negative ease aims smaller", () => {
    assert.equal(size({ ease: -2 }).best, 36);
  });

  test("oversized ease aims larger", () => {
    assert.equal(size({ ease: 6 }).best, 44);
  });

  test("reports no gauge adjustment", () => {
    const r = size();
    assert.equal(r.gaugeAdjusted, false);
    assert.equal(r.actual, r.best);
  });

  test("needs sizes and a measurement before it will answer", () => {
    assert.equal(size({ sizes: [] }), null);
    assert.equal(size({ bust: null }), null);
    assert.equal(size({ bust: 0 }), null);
  });

  test("copes with a single-size pattern", () => {
    const r = size({ sizes: [40] });
    assert.equal(r.best, 40);
    assert.equal(r.runnerUp, null);
  });
});

describe("adviseSize: with a personal gauge", () => {
  test("a tighter knitter is sent up the size range", () => {
    /* 21 sts per 4 in against the pattern's 18: the same instructions come out
       narrower, so the size that really lands on 40 in is a bigger one.
       Worked at this gauge the 48 comes out 41.1 in and the 44 comes out
       37.7 in, so the 48 is the closer call. */
    const r = size({ patternGauge: 18, myGauge: 21 });
    assert.equal(r.best, 48);
    assert.equal(r.gaugeAdjusted, true);
    assert.equal(r.actual, 41.1);
  });

  test("a looser knitter is sent down the size range", () => {
    const r = size({ patternGauge: 18, myGauge: 16 });
    assert.equal(r.best, 36);
    assert.equal(r.actual, 40.5);
  });

  test("a matching gauge behaves as if no gauge were given", () => {
    const withGauge = size({ patternGauge: 18, myGauge: 18 });
    assert.equal(withGauge.best, size().best);
    assert.equal(withGauge.actual, 40);
  });

  test("one gauge alone is not enough to adjust by", () => {
    assert.equal(size({ patternGauge: 18 }).gaugeAdjusted, false);
    assert.equal(size({ myGauge: 21 }).gaugeAdjusted, false);
  });

  test("`actual` is what the knitter will really measure", () => {
    /* This is the number the size card must quote, otherwise it claims a
       finished measurement the tension card then contradicts. */
    const r = size({ patternGauge: 18, myGauge: 21 });
    assert.equal(r.actual, Math.round(((r.best * 18) / 21) * 10) / 10);
    assert.notEqual(r.actual, r.best);
  });
});

describe("adviseSize: the runner-up", () => {
  test("stays quiet when one size is clearly best", () => {
    assert.equal(size().runnerUp, null);
  });

  test("speaks up when two sizes are within a close call", () => {
    /* Target 38 sits exactly between 36 and 40. */
    const r = adviseSize({
      sizes: [36, 40],
      bust: 38,
      ease: 0,
      patternGauge: null,
      myGauge: null,
      closeGap: CLOSE,
    });
    assert.ok(r.runnerUp !== null);
    assert.equal(r.runnerUp, r.best === 36 ? 40 : 36);
  });

  test("ranks by fit, not by nearness in inches", () => {
    /* An unevenly spaced range: 41 is the nearer number to 40, but 39 is the
       better fit for a 39.5 target. The old rule picked 41. */
    const r = adviseSize({
      sizes: [39, 40, 41],
      bust: 39.5,
      ease: 0,
      patternGauge: null,
      myGauge: null,
      closeGap: 2,
    });
    assert.equal(r.best, 39);
    assert.equal(r.runnerUp, 40);
  });

  test("never offers a size that fits better than the winner", () => {
    const r = size();
    if (r.runnerUp !== null) {
      const missBest = Math.abs(r.best - r.target);
      const missRunner = Math.abs(r.runnerUp - r.target);
      assert.ok(missRunner >= missBest);
    }
  });

  test("an exact tie goes to the smaller size", () => {
    /* Strict less-than keeps the first, and sizes run smallest to largest.
       The runner-up copy leans on this being stable, so pin it. */
    const r = adviseSize({
      sizes: [36, 40],
      bust: 38,
      ease: 0,
      patternGauge: null,
      myGauge: null,
      closeGap: CLOSE,
    });
    assert.equal(r.best, 36);
    assert.equal(r.runnerUp, 40);
  });

  test("a pattern that repeats a measurement is not its own runner-up", () => {
    /* With sizes [40, 40] the duplicate used to come back as runnerUp, and
       Nana would recommend the 40 while adding that the 40 was close too. */
    const r = size({ sizes: [40, 40] });
    assert.equal(r.best, 40);
    assert.equal(r.runnerUp, null);
  });
});

describe("adviseSize: the string path the component actually walks", () => {
  test("bust and gauges arrive as text and still work", () => {
    const r = size({ bust: "38", patternGauge: "18", myGauge: "21" });
    assert.equal(r.best, 48);
    assert.equal(r.actual, 41.1);
  });

  test("a European decimal gauge keeps its half", () => {
    /* "17,5" through parseFloat is 17 — half a stitch gone, which is enough
       to flip the recommendation on a fine-gauge pattern. */
    const withComma = size({ patternGauge: "17,5", myGauge: "17.5" });
    assert.equal(withComma.gaugeAdjusted, true);
    assert.equal(withComma.actual, withComma.best);
  });

  test("ease as text cannot glue itself onto the target", () => {
    /* b + "2" would be "382", and the largest size wins in silence. */
    assert.equal(size({ ease: "2" }).target, 40);
  });
});

describe("adviseYarn", () => {
  const yarn = (over) =>
    adviseYarn({ yards: YARDS, sizes: SIZES, bestIdx: 2, perSkein: 220, skeins: 6, ...over });

  test("asks for yardage when the pattern's list is missing", () => {
    const r = yarn({ yards: [] });
    assert.equal(r.kind, "needSizes");
    assert.equal(r.tone, "ask");
  });

  test("says so when the yardage list is too short to reach this size", () => {
    const r = yarn({ yards: [900, 1000] });
    assert.equal(r.kind, "listShort");
    assert.equal(r.tone, "warn");
  });

  test("asks about the basket when the yardage is known but the stash is not", () => {
    const r = yarn({ perSkein: null, skeins: null });
    assert.equal(r.kind, "askBasket");
    assert.equal(r.need, 1100);
    assert.equal(r.buffered, 1210);
  });

  test("gives the all-clear when the cushion is covered", () => {
    /* 6 x 220 = 1320, against 1100 needed and 1210 cushioned. */
    const r = yarn();
    assert.equal(r.kind, "allSet");
    assert.equal(r.tone, "ok");
    assert.equal(r.have, 1320);
  });

  test("warns when the yarn covers the pattern but not the cushion", () => {
    /* 5 x 230 = 1150: over 1100, under 1210. */
    const r = yarn({ perSkein: 230, skeins: 5 });
    assert.equal(r.kind, "justCovers");
    assert.equal(r.tone, "warn");
  });

  test("counts the extra skeins when the basket is short", () => {
    /* 4 x 220 = 880, cushioned need 1210, so 330 short at 220 a skein. */
    const r = yarn({ skeins: 4 });
    assert.equal(r.kind, "short");
    assert.equal(r.shortAmt, 330);
    assert.equal(r.moreSkeins, 2);
  });

  test("rounds part skeins upward, because you cannot buy two thirds of one", () => {
    const r = yarn({ perSkein: 500, skeins: 1 });
    assert.equal(r.kind, "short");
    assert.equal(r.moreSkeins, Math.ceil(r.shortAmt / 500));
  });

  test("notices when the two lists are different lengths", () => {
    assert.equal(yarn({ yards: [900, 1000, 1100] }).mismatch, true);
    assert.equal(yarn().mismatch, false);
  });

  test("the cushion is ten per cent, rounded up", () => {
    assert.equal(yarn({ yards: [1000], bestIdx: 0, sizes: [32] }).buffered, 1100);
  });

  test("a basket typed as text counts the same as numbers", () => {
    const r = yarn({ perSkein: "220", skeins: "6" });
    assert.equal(r.kind, "allSet");
    assert.equal(r.have, 1320);
  });

  test('a thousands-marked "1,100" per skein is eleven hundred yards', () => {
    /* parseFloat read it as 1 — and then advised buying twelve hundred more
       skeins of a yarn the knitter already had plenty of. */
    const r = yarn({ perSkein: "1,100", skeins: "2" });
    assert.equal(r.kind, "allSet");
    assert.equal(r.have, 2200);
  });

  test("landing exactly on the cushion still counts as all set", () => {
    /* 5 x 242 = 1210, the buffered figure to the yard. */
    assert.equal(yarn({ perSkein: 242, skeins: 5 }).kind, "allSet");
  });
});

describe("adviseGauge", () => {
  test("asks for the pattern's gauge first", () => {
    assert.equal(adviseGauge({ patternGauge: null, myGauge: 18, best: 40 }).kind, "askPattern");
  });

  test("then asks for yours", () => {
    assert.equal(adviseGauge({ patternGauge: 18, myGauge: null, best: 40 }).kind, "askYours");
  });

  test("counts a quarter stitch as a match, since counting is not that precise", () => {
    assert.equal(adviseGauge({ patternGauge: 18, myGauge: 18.2, best: 40 }).kind, "match");
    assert.equal(adviseGauge({ patternGauge: 18, myGauge: 18.3, best: 40 }).kind, "off");
  });

  test("tighter gauge means a narrower result and a larger tool", () => {
    const r = adviseGauge({ patternGauge: 18, myGauge: 21, best: 44 });
    assert.equal(r.kind, "off");
    assert.equal(r.tighter, true);
    assert.equal(r.actual, 37.7);
  });

  test("looser gauge means a wider result", () => {
    const r = adviseGauge({ patternGauge: 18, myGauge: 16, best: 36 });
    assert.equal(r.tighter, false);
    assert.equal(r.actual, 40.5);
  });

  test("turns the gauge gap into a number of tool sizes", () => {
    /* Roughly 2 stitches per 4 in per needle or hook size. */
    assert.equal(adviseGauge({ patternGauge: 18, myGauge: 20, best: 40 }).toolSizes, 1);
    assert.equal(adviseGauge({ patternGauge: 18, myGauge: 22, best: 40 }).toolSizes, 2);
    assert.equal(adviseGauge({ patternGauge: 18, myGauge: 21, best: 40 }).toolSizes, 1.5);
  });

  test("never suggests zero sizes, having just said the gauge is off", () => {
    assert.ok(adviseGauge({ patternGauge: 18, myGauge: 18.4, best: 40 }).toolSizes >= 0.5);
  });

  test("a gap of exactly a quarter stitch is past the tolerance", () => {
    assert.equal(adviseGauge({ patternGauge: 18, myGauge: 18.25, best: 40 }).kind, "off");
  });

  test('a European "17,5" matches a pattern\'s 17.5, as it should', () => {
    const r = adviseGauge({ patternGauge: "17.5", myGauge: "17,5", best: 40 });
    assert.equal(r.kind, "match");
  });
});

describe("sizeTable: every size at a glance", () => {
  const table = (over) =>
    sizeTable({
      sizes: SIZES,
      yards: YARDS,
      bust: 38,
      ease: 2,
      patternGauge: null,
      myGauge: null,
      perSkein: 220,
      skeins: 6,
      bestIdx: 2,
      runnerUp: null,
      ...over,
    });

  test("one row per size, in the pattern's order", () => {
    const t = table();
    assert.deepEqual(t.rows.map((r) => r.size), SIZES);
    assert.deepEqual(t.rows.map((r) => r.need), YARDS);
  });

  test("without a personal gauge, sizes come out as the pattern claims", () => {
    const t = table();
    assert.equal(t.gaugeAdjusted, false);
    for (const r of t.rows) assert.equal(r.actual, r.size);
  });

  test("with both gauges, every row is re-worked for this knitter's hands", () => {
    /* The same 18-vs-21 case the size card is tested on: the 48 must come out
       41.1 here too, or the table would contradict the recommendation. */
    const t = table({ patternGauge: 18, myGauge: 21, bestIdx: 4 });
    assert.equal(t.gaugeAdjusted, true);
    assert.equal(t.rows[4].actual, 41.1);
    assert.equal(t.rows[0].actual, r1((32 * 18) / 21));
  });

  test("the diff column agrees with the numbers printed beside it", () => {
    const t = table({ patternGauge: 18, myGauge: 21 });
    for (const r of t.rows) {
      assert.equal(r.diff, r1(r.actual - t.target));
    }
  });

  test("the basket verdicts mirror the yarn card's cushion arithmetic", () => {
    /* 6 x 220 = 1320: clears 1210 for the 40, only just covers the 44's 1250
       (cushioned 1375), and falls short of the 48's 1400. Same three verdicts,
       same thresholds, as adviseYarn would give size by size. */
    const t = table();
    assert.equal(t.rows[2].stash, "plenty");
    assert.equal(t.rows[3].stash, "justEnough");
    assert.equal(t.rows[4].stash, "short");
    assert.equal(t.rows[4].shortAmt, Math.ceil(1400 * 1.1) - 1320);
  });

  test("the short amount is what adviseYarn would ask her to buy", () => {
    const t = table({ skeins: 4 });
    const y = adviseYarn({ yards: YARDS, sizes: SIZES, bestIdx: 2, perSkein: 220, skeins: 4 });
    assert.equal(t.rows[2].stash, "short");
    assert.equal(t.rows[2].shortAmt, y.shortAmt);
  });

  test("an empty basket leaves the verdict column honestly blank", () => {
    const t = table({ perSkein: null, skeins: null });
    assert.equal(t.hasVerdicts, false);
    for (const r of t.rows) assert.equal(r.stash, null);
  });

  test("a yardage list that runs out leaves blanks, not guesses", () => {
    const t = table({ yards: [900, 1000] });
    assert.equal(t.hasYards, true);
    assert.equal(t.rows[1].need, 1000);
    assert.equal(t.rows[2].need, null);
    assert.equal(t.rows[2].stash, null);
  });

  test("no yardage at all is reported so the column can be dropped", () => {
    assert.equal(table({ yards: [] }).hasYards, false);
  });

  test("the best and runner-up rows are the ones adviseSize chose", () => {
    const s = adviseSize({ sizes: [36, 40], bust: 38, ease: 0, patternGauge: null, myGauge: null, closeGap: 1 });
    const t = table({ sizes: [36, 40], ease: 0, bestIdx: s.bestIdx, runnerUp: s.runnerUp });
    assert.equal(t.rows[0].best, true);
    assert.equal(t.rows[1].runnerUp, true);
    assert.equal(t.rows[1].best, false);
  });

  test("a one-size pattern has nothing to compare", () => {
    assert.equal(table({ sizes: [40] }), null);
  });

  test("needs a measurement, like the size card does", () => {
    assert.equal(table({ bust: null }), null);
    assert.equal(table({ bust: "" }), null);
  });

  test("fields typed as text still count", () => {
    const t = table({ bust: "38", perSkein: "220", skeins: "6", patternGauge: "18", myGauge: "21" });
    assert.equal(t.gaugeAdjusted, true);
    assert.equal(t.hasVerdicts, true);
  });
});

describe("adviseRows", () => {
  test("asks for each row gauge in turn", () => {
    assert.equal(adviseRows({ patternRowGauge: null, myRowGauge: 26, swatchSpan: 4 }).kind, "askPattern");
    assert.equal(adviseRows({ patternRowGauge: 24, myRowGauge: null, swatchSpan: 4 }).kind, "askYours");
  });

  test("a close row gauge is a match", () => {
    assert.equal(adviseRows({ patternRowGauge: 24, myRowGauge: 24.1, swatchSpan: 4 }).kind, "match");
  });

  test("more rows per swatch means a shorter piece, and more rows to work", () => {
    const r = adviseRows({ patternRowGauge: 24, myRowGauge: 26, swatchSpan: 4 });
    assert.equal(r.tighter, true);
    assert.equal(r.intended, 16.7); // 100 rows at 24 per 4 in
    assert.equal(r.yours, 15.4); // 100 rows at 26 per 4 in
    assert.equal(r.needed, 108); // to reach the same length
    assert.ok(r.yours < r.intended);
  });

  test("fewer rows per swatch means a longer piece, and fewer rows to work", () => {
    const r = adviseRows({ patternRowGauge: 24, myRowGauge: 22, swatchSpan: 4 });
    assert.equal(r.tighter, false);
    assert.equal(r.needed, 92);
    assert.ok(r.yours > r.intended);
  });

  test("the working length is the same however the swatch is quoted", () => {
    const inches = adviseRows({ patternRowGauge: 24, myRowGauge: 26, swatchSpan: 4 });
    const metric = adviseRows({ patternRowGauge: 24, myRowGauge: 26, swatchSpan: 10 });
    assert.equal(inches.needed, metric.needed);
    assert.ok(Math.abs(metric.intended / inches.intended - 2.5) < 0.01);
  });

  test("a correction that rounds back to 100 rows is a match, not a worry", () => {
    /* 24.3 against 24 clears the quarter-row tolerance, but the remedy works
       out to 101 rows where the pattern says 100 — counting noise. Nana should
       not send anyone to re-swatch over that. */
    assert.equal(adviseRows({ patternRowGauge: 24, myRowGauge: 24.3, swatchSpan: 4 }).kind, "match");
    assert.equal(adviseRows({ patternRowGauge: 50, myRowGauge: 50.3, swatchSpan: 10 }).kind, "match");
  });

  test("a missing swatch span falls back to four inches instead of NaN", () => {
    const r = adviseRows({ patternRowGauge: 24, myRowGauge: 26 });
    assert.equal(r.kind, "off");
    assert.equal(r.intended, 16.7);
  });

  test("row gauges typed as text keep their halves too", () => {
    assert.equal(adviseRows({ patternRowGauge: "24,5", myRowGauge: "24.5", swatchSpan: 10 }).kind, "match");
  });
});
