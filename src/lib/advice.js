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

import { r1, parseOne } from "./parse.js";

/* Fields arrive as raw text, and the text can say "17,5" and mean seventeen
   and a half. parseOne knows the comma rules; parseFloat does not, and would
   quietly hand back 17. */
const num = (v) => {
  if (typeof v === "number") return isFinite(v) && v > 0 ? v : null;
  return parseOne(v);
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

  /* Number(), not num(): ease is legitimately zero or negative. The guard is
     against a stray string sneaking in and turning b + ease into "382". */
  const target = b + (Number(ease) || 0);
  const missBy = (s) => Math.abs(realWidth(s) - target);

  let bestIdx = 0;
  sizes.forEach((s, i) => {
    if (missBy(s) < missBy(sizes[bestIdx])) bestIdx = i;
  });
  const best = sizes[bestIdx];

  /* Is a second size nearly as good? Rank the rest by how much worse they fit,
     not by how near they are in inches — with unevenly spaced size ranges those
     are different questions, and the knitter is asking the first one. A pattern
     that repeats a measurement must not have that same number offered back as
     its own runner-up. */
  const gap = num(closeGap) ?? 0;
  let runnerUp = null;
  let runnerUpMiss = Infinity;
  sizes.forEach((s, i) => {
    if (i === bestIdx || s === best) return;
    const worseBy = missBy(s) - missBy(best);
    if (worseBy < 0 || worseBy > gap) return;
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

/* A pattern's yardage assumes the pattern's gauge. Nana picks a size by
   stitch count, so a tight knitter follows a bigger size that comes out
   smaller — and less fabric wants less yarn. A loose knitter is the other
   way round, which is the case that ends at the second sleeve. To first
   order the yarn in a piece scales with the size of each stitch, and stitch
   size is 1/gauge, so the pattern's figure is multiplied by pg/ug. Row
   gauge, stitch pattern and the yarn itself all tug at that, which is why
   every sentence built on it calls it a rough guide. Whole yards or metres,
   like the figure it adjusts; unchanged while either gauge is missing. */
export const yarnAtGauge = (need, patternGauge, myGauge) => {
  const pg = num(patternGauge);
  const ug = num(myGauge);
  if (pg === null || ug === null) return need;
  return Math.round((need * pg) / ug);
};

export function adviseYarn({ yards, sizes, bestIdx, perSkein, skeins, patternGauge, myGauge }) {
  const list = Array.isArray(yards) ? yards : [];
  const mismatch = list.length > 0 && list.length !== (sizes ? sizes.length : 0);

  if (list.length === 0) return { kind: "needSizes", tone: "ask", mismatch: false };
  if (list.length <= bestIdx) return { kind: "listShort", tone: "warn", mismatch: false };

  /* `need` is what this knitter will use; `patternNeed` is what the pattern
     printed, kept so the wording can show its working. The adjustment is
     only worth a sentence when it actually moved the number. */
  const patternNeed = list[bestIdx];
  const need = yarnAtGauge(patternNeed, patternGauge, myGauge);
  const gaugeAdjusted = need !== patternNeed;
  const tighter = gaugeAdjusted && num(myGauge) > num(patternGauge);
  const buffered = Math.ceil(need * YARN_CUSHION);
  const per = num(perSkein);
  const cnt = num(skeins);
  const common = { need, patternNeed, gaugeAdjusted, tighter, buffered, mismatch };

  if (per === null || cnt === null) {
    return { kind: "askBasket", tone: "ask", ...common };
  }

  const have = r1(per * cnt);
  if (have >= buffered) {
    return { kind: "allSet", tone: "ok", ...common, have };
  }
  if (have >= need) {
    return { kind: "justCovers", tone: "warn", ...common, have };
  }
  const shortAmt = Math.ceil(buffered - have);
  return {
    kind: "short",
    tone: "warn",
    ...common,
    have,
    shortAmt,
    moreSkeins: Math.ceil(shortAmt / per),
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

/* ---------- will another yarn do ----------
   The pattern's yarn is out of reach, and the knitter is holding a ball band.
   Its gauge against the pattern's is the first test of a substitute — not
   the last, since fibre and drape are the knitter's call — and the same
   half-stitch-per-tool-size rule of thumb says what a needle change could
   coax. One stitch per swatch is the same weight class, near enough; three is
   the edge of what a needle change can reach; beyond that it is a different
   yarn, whatever the band says. Returns null while no band gauge is typed,
   because a helper with nothing to compare should stay quiet. */
export const SUBSTITUTE_CLOSE = 1;
export const SUBSTITUTE_STRETCH = 3;

export function adviseSubstitute({ patternGauge, bandGauge }) {
  const bg = num(bandGauge);
  if (bg === null) return null;
  const pg = num(patternGauge);
  if (pg === null) return { kind: "askPattern", tone: "ask", bg };

  const away = r1(Math.abs(bg - pg));
  const finer = bg > pg;
  const toolSizes = Math.max(0.5, Math.round((away / STITCHES_PER_TOOL_SIZE) * 2) / 2);
  const facts = { bg, pg, away, finer, toolSizes };

  if (away < GAUGE_TOLERANCE) return { kind: "match", tone: "ok", ...facts, toolSizes: 0 };
  if (away <= SUBSTITUTE_CLOSE) return { kind: "close", tone: "ok", ...facts };
  if (away <= SUBSTITUTE_STRETCH) return { kind: "stretch", tone: "warn", ...facts };
  return { kind: "no", tone: "warn", ...facts };
}

/* Balls to buy for a cushioned need, at this yarn's put-up. Whole balls,
   because shops do not sell fractions; null until both numbers exist. */
export const ballsFor = (need, perSkein) => {
  const per = num(perSkein);
  if (per === null || !(need > 0)) return null;
  return Math.ceil(need / per);
};

/* ---------- every size at a glance ----------
   The size card answers "what should I make?". The table answers "what are my
   choices?" — which is the question a knitter with a fixed stash, or a body
   that lands between sizes, is actually weighing. One row per pattern size:
   what the label claims, what it would really measure in this knitter's hands,
   how far that lands from her aim, the yarn it calls for, and whether the
   basket covers it.

   The basket verdict runs the same cushion arithmetic as adviseYarn, so the
   table can never contradict the yarn card sitting above it. The best and
   runner-up rows are taken from adviseSize's answer rather than re-derived,
   for the same reason: one source of truth per decision.

   Needs at least two sizes — a one-size pattern has nothing to compare. */
export function sizeTable({
  sizes,
  yards,
  bust,
  ease,
  patternGauge,
  myGauge,
  perSkein,
  skeins,
  bestIdx,
  runnerUp,
}) {
  const b = num(bust);
  if (!Array.isArray(sizes) || sizes.length < 2 || b === null) return null;

  const pg = num(patternGauge);
  const ug = num(myGauge);
  const gaugeAdjusted = pg !== null && ug !== null;
  const target = b + (Number(ease) || 0);

  const list = Array.isArray(yards) ? yards : [];
  const per = num(perSkein);
  const cnt = num(skeins);
  const have = per !== null && cnt !== null ? r1(per * cnt) : null;

  const rows = sizes.map((s, i) => {
    const actual = gaugeAdjusted ? r1((s * pg) / ug) : s;
    /* Diff of the rounded figure, so the column always agrees with the
       "comes out" number printed beside it, to the decimal shown. */
    const diff = r1(actual - r1(target));

    /* Yardage lines up with sizes by position; a shorter list simply runs
       out, and the missing cells stay honest blanks instead of guesses.
       Scaled for gauge exactly as the yarn card scales its own figure. */
    const patternNeed = i < list.length ? list[i] : null;
    const need = patternNeed === null ? null : yarnAtGauge(patternNeed, patternGauge, myGauge);

    let stash = null;
    let shortAmt = null;
    if (need !== null && have !== null) {
      const buffered = Math.ceil(need * YARN_CUSHION);
      if (have >= buffered) stash = "plenty";
      else if (have >= need) stash = "justEnough";
      else {
        stash = "short";
        shortAmt = Math.ceil(buffered - have);
      }
    }

    return {
      size: s,
      actual,
      diff,
      need,
      patternNeed,
      stash,
      shortAmt,
      best: i === bestIdx,
      runnerUp: runnerUp !== null && s === runnerUp,
    };
  });

  return {
    rows,
    gaugeAdjusted,
    hasYards: list.length > 0,
    /* Whether the basket column has anything to say. A stocked basket with no
       yardage list would otherwise draw a whole column of dashes. */
    hasVerdicts: rows.some((r) => r.stash !== null),
    /* Whether the yarn column shows something other than the pattern's own
       figures — worth a footnote, and only then. */
    yarnAdjusted: rows.some((r) => r.need !== null && r.need !== r.patternNeed),
    target: r1(target),
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
  const span = num(swatchSpan) ?? 4;

  if (prg === null) return { kind: "askPattern", tone: "ask" };
  if (urg === null) return { kind: "askYours", tone: "ask" };
  if (Math.abs(urg - prg) < GAUGE_TOLERANCE) {
    return { kind: "match", tone: "ok", urg, prg };
  }

  /* Row gauges run 24 to 40+ per swatch, so a fixed quarter-row tolerance is a
     ~1% test — fine for stitches, twitchy for rows. If the correction itself
     rounds back to 100-ish rows, there is nothing to correct: telling a knitter
     to "work about 101 rows instead of 100" is a worry, not advice. */
  const needed = Math.round((100 * urg) / prg);
  if (Math.abs(needed - 100) <= 1) {
    return { kind: "match", tone: "ok", urg, prg };
  }

  return {
    kind: "off",
    tone: "warn",
    urg,
    prg,
    tighter: urg > prg,
    yours: r1((100 / urg) * span),
    intended: r1((100 / prg) * span),
    needed,
  };
}
