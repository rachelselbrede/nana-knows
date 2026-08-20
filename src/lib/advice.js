/* Nana's arithmetic.
   ---------------------------------------------------------------------------
   Every function here is pure: numbers in, numbers and a `kind` out. No React,
   no wording, no language. The component turns a `kind` plus its numbers into a
   sentence at render time, which is what lets the advice follow the visitor
   when she switches between English and Spanish after asking.

   `tone` is presentation-adjacent but belongs to the decision, not the phrasing:
     ok    nothing to worry about
     ask   Nana needs another number before she can say
     warn  something is off, or short, and wants attention */

import { r1 } from "./parse.js";

const num = (v) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return isFinite(n) && n > 0 ? n : null;
};

/* ---------- which size to make ----------
   A pattern size `s` is a finished measurement worked at the pattern's gauge,
   which means a stitch count of s * pg / 4. Work that same stitch count at your
   gauge and it comes out s * pg / ug wide. So when we know both gauges we
   compare sizes by what they would really measure in this knitter's hands,
   not by what the pattern claims. */
export function adviseSize({ sizes, bust, ease, patternGauge, myGauge, closeGap }) {
  const b = num(bust);
  if (!Array.isArray(sizes) || sizes.length === 0 || b === null) return null;

  const pg = num(patternGauge);
  const ug = num(myGauge);
  const gaugeAdjusted = pg !== null && ug !== null;
  const realWidth = (s) => (gaugeAdjusted ? (s * pg) / ug : s);

  const target = b + ease;
  const missBy = (s) => Math.abs(realWidth(s) - target);

  let bestIdx = 0;
  sizes.forEach((s, i) => {
    if (missBy(s) < missBy(sizes[bestIdx])) bestIdx = i;
  });
  const best = sizes[bestIdx];

  /* Is a second size nearly as good? Rank the rest by how much worse they fit,
     not by how near they are in inches — with unevenly spaced size ranges those
     are different questions, and the knitter is asking the first one. */
  let runnerUp = null;
  let runnerUpMiss = Infinity;
  sizes.forEach((s, i) => {
    if (i === bestIdx) return;
    const worseBy = missBy(s) - missBy(best);
    if (worseBy < 0 || worseBy > closeGap) return;
    if (missBy(s) < runnerUpMiss) {
      runnerUpMiss = missBy(s);
      runnerUp = s;
    }
  });

  return {
    bestIdx,
    best,
    target: r1(target),
    runnerUp,
    gaugeAdjusted,
    /* What the size-`best` instructions will really measure for this knitter. */
    actual: r1(realWidth(best)),
  };
}

/* ---------- will the basket stretch ----------
   Nana adds 10% because running out at the second sleeve is heartbreak. */
export const YARN_CUSHION = 1.1;

export function adviseYarn({ yards, sizes, bestIdx, perSkein, skeins }) {
  const list = Array.isArray(yards) ? yards : [];
  const mismatch = list.length > 0 && list.length !== (sizes ? sizes.length : 0);

  if (list.length === 0) return { kind: "needSizes", tone: "ask", mismatch: false };
  if (list.length <= bestIdx) return { kind: "listShort", tone: "warn", mismatch: false };

  const need = list[bestIdx];
  const buffered = Math.ceil(need * YARN_CUSHION);
  const per = num(perSkein);
  const cnt = num(skeins);

  if (per === null || cnt === null) {
    return { kind: "askBasket", tone: "ask", need, buffered, mismatch };
  }

  const have = r1(per * cnt);
  if (have >= buffered) {
    return { kind: "allSet", tone: "ok", need, buffered, have, mismatch };
  }
  if (have >= need) {
    return { kind: "justCovers", tone: "warn", need, buffered, have, mismatch };
  }
  const shortAmt = Math.ceil(buffered - have);
  return {
    kind: "short",
    tone: "warn",
    need,
    buffered,
    have,
    shortAmt,
    moreSkeins: Math.ceil(shortAmt / per),
    mismatch,
  };
}

/* ---------- stitch gauge, which decides width ----------
   A quarter of a stitch per swatch is inside the noise of counting, so anything
   closer than that counts as a match. */
export const GAUGE_TOLERANCE = 0.25;

/* Rule of thumb: one needle or hook size moves gauge by roughly half a stitch
   per inch, so about 2 stitches per 4 in. Reported to the nearest half size,
   because "go up about one and a half sizes" is advice a person can act on. */
export const STITCHES_PER_TOOL_SIZE = 2;

export function adviseGauge({ patternGauge, myGauge, best }) {
  const pg = num(patternGauge);
  const ug = num(myGauge);

  if (pg === null) return { kind: "askPattern", tone: "ask" };
  if (ug === null) return { kind: "askYours", tone: "ask" };
  if (Math.abs(ug - pg) < GAUGE_TOLERANCE) {
    return { kind: "match", tone: "ok", ug, pg, best };
  }

  const tighter = ug > pg;
  const toolSizes = Math.max(
    0.5,
    Math.round((Math.abs(ug - pg) / STITCHES_PER_TOOL_SIZE) * 2) / 2
  );
  return {
    kind: "off",
    tone: "warn",
    ug,
    pg,
    best,
    tighter,
    actual: r1((best * pg) / ug),
    toolSizes,
  };
}

/* ---------- row gauge, which decides length ----------
   Stitch gauge only ever answers "how wide". Row gauge is what decides whether
   a body or a sleeve ends up the length the pattern intended, and it is the
   gauge most of us skip swatching for.

   Quoted per 100 rows, because patterns count rows, not inches. */
export function adviseRows({ patternRowGauge, myRowGauge, swatchSpan }) {
  const prg = num(patternRowGauge);
  const urg = num(myRowGauge);

  if (prg === null) return { kind: "askPattern", tone: "ask" };
  if (urg === null) return { kind: "askYours", tone: "ask" };
  if (Math.abs(urg - prg) < GAUGE_TOLERANCE) {
    return { kind: "match", tone: "ok", urg, prg };
  }

  return {
    kind: "off",
    tone: "warn",
    urg,
    prg,
    tighter: urg > prg,
    yours: r1((100 / urg) * swatchSpan),
    intended: r1((100 / prg) * swatchSpan),
    needed: Math.round((100 * urg) / prg),
  };
}
