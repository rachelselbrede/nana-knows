/* Reading what a knitter actually typed.
   ---------------------------------------------------------------------------
   These are the only functions that touch raw text, and they are deliberately
   free of React and of language, so they can be tested on their own.

   The hard part is the comma. It means three different things depending on who
   is holding the pencil:

     "32, 36, 40"  a list
     "91,5"        ninety-one and a half, to most of Europe
     "1,100"       one thousand one hundred, to most of America

   No rule gets every case right, so the rules below aim to be right about the
   numbers knitters really type, and to report an `issues` list for the ones
   that stayed ambiguous. The interface echoes the parse back to the visitor
   ("Nana read: 32, 36, 40"), which is what actually makes this safe: a wrong
   guess becomes visible instead of silently changing the advice. */

export const r1 = (n) => Math.round(n * 10) / 10;

const DIGITS_ONLY = /^\d+$/;

/* Pull a number out of one clean chunk, ignoring any unit words stuck to it
   ("36in", "1200yds"). Returns null for anything that is not a usable number. */
const toNumber = (part) => {
  const n = parseFloat(String(part).replace(/[^0-9.]/g, ""));
  return isFinite(n) && n > 0 ? n : null;
};

/* Decide what a token containing commas is trying to say.
   Returns an array of strings, each meant to be one number. */
function splitCommas(token, issues) {
  const parts = token.split(",");
  const commas = parts.length - 1;

  if (commas === 0) return [token];

  /* Both a dot and a comma. Whichever comes last is the decimal mark. */
  if (token.includes(".")) {
    const lastComma = token.lastIndexOf(",");
    const lastDot = token.lastIndexOf(".");
    if (lastComma > lastDot) {
      /* "1.100,5" — European: dots group thousands, the comma is the decimal. */
      return [token.replace(/\./g, "").replace(",", ".")];
    }
    /* "32.5,36.5" — the dot is the decimal, so the comma can only be a list.
       The old parser turned this into a single 32.5 and quietly lost a size. */
    return parts;
  }

  if (commas === 1) {
    const after = parts[1];
    /* Knitters write European decimals to one place ("91,5"), essentially never
       to two. So the digit count after the comma is a reliable tell. */
    if (DIGITS_ONLY.test(after) && after.length === 1) return [parts.join(".")];
    if (DIGITS_ONLY.test(after) && after.length === 3) {
      /* "1,100" is a thousands mark; "900,100" would be a very odd one. Both
         look identical, so take the common reading and say so. */
      issues.push("thousands");
      return [parts.join("")];
    }
    /* "32,36" and "900,1000" are lists. */
    return parts;
  }

  /* Several commas. Usually a plain list ("32,36,40"), but it can be a list of
     thousands-marked numbers ("1,100,1,250"). The latter alternates a short
     group with an exactly-three-digit group, and needs an even number of parts.
     Every leading group must be shorter than three digits: a real thousands
     list never grows a three-digit lead, but a cm size list crossing 100
     ("97,102,107,112") does, and it must stay a list. */
  const even = parts.length % 2 === 0;
  const leads = parts.filter((_, i) => i % 2 === 0);
  const tails = parts.filter((_, i) => i % 2 === 1);
  const looksThousands =
    even &&
    leads.every((p) => /^\d{1,2}$/.test(p)) &&
    tails.every((p) => /^\d{3}$/.test(p));

  if (looksThousands) {
    issues.push("thousands");
    return leads.map((lead, i) => lead + tails[i]);
  }
  return parts;
}

/* Knitters write half sizes as fractions. The unicode ones can be turned into
   decimals in place; "1/2" needs handling at the token level below. */
const VULGAR = {
  "\u00bd": ".5", "\u00bc": ".25", "\u00be": ".75", "\u2153": ".33", "\u2154": ".67",
  "\u215b": ".125", "\u215c": ".375", "\u215d": ".625", "\u215e": ".875",
};
const VULGAR_RE = /[\u00bd\u00bc\u00be\u2153\u2154\u215b\u215c\u215d\u215e]/;

/* Turn a free-typed list into numbers, with a note of anything Nana had to
   guess at. Returns { values, issues }. */
export function parseNumberList(text) {
  const issues = [];
  const values = [];

  let source = String(text || "");
  /* A line pasted whole from a pattern usually opens with a label, and the
     label can carry numbers of its own — "Size 1 (2, 3, 4): 32 (36, 40, 44)".
     Everything up to the last colon is the label. If dropping it dropped
     digits, say so, since the echo will then show fewer numbers than were
     pasted and the knitter deserves to know why. */
  const colon = source.lastIndexOf(":");
  if (colon !== -1) {
    if (/\d/.test(source.slice(0, colon))) issues.push("label");
    source = source.slice(colon + 1);
  }

  source
    /* Pattern notation: "32 (36, 40, 44)", with brackets or braces from some
       designers, and sometimes no spaces at all. A bracket is only ever a
       separator, never part of a number — "32(36" used to be read as 3236,
       finite and positive, so nothing downstream objected. */
    .replace(/[()[\]{}]/g, " ")
    /* En dashes and em dashes are ranges too, however they were typed. */
    .replace(/[\u2012-\u2015\u2212]/g, "-")
    /* "36\u00bd" and "36 \u00bd" both mean thirty-six and a half. */
    .replace(new RegExp(`(\\d)\\s*(${VULGAR_RE.source})`, "g"), (_, d, f) => {
      issues.push("fraction");
      return d + VULGAR[f];
    })
    .replace(new RegExp(VULGAR_RE.source, "g"), (f) => {
      issues.push("fraction");
      return "0" + VULGAR[f];
    })
    /* A comma before a space always breaks a list, whatever else commas do. */
    .replace(/,(?=\s)/g, " ")
    .split(/[;\s]+/)
    .filter(Boolean)
    .forEach((token) => {
      /* "36 1/2" arrives here as its own token "1/2", the whole number having
         gone ahead of it. A proper fraction after a whole number completes it;
         anywhere else it stands alone. Either way the slash must be handled
         here, or toNumber strips it and reads "1/2" as 12. */
      const frac = token.match(/^(\d+)\/(\d+)$/);
      if (frac) {
        const n = Number(frac[1]) / Number(frac[2]);
        if (isFinite(n) && n > 0) {
          issues.push("fraction");
          const prev = values.length - 1;
          if (n < 1 && prev >= 0 && Number.isInteger(values[prev])) {
            values[prev] += n;
          } else {
            values.push(n);
          }
        }
        return;
      }

      /* "32-36" used to become 3236: finite, positive, and nonsense, so nothing
         downstream ever objected. Treat dashes between numbers as breaks and
         flag them, since only the knitter knows if she meant a range. Each side
         goes through the comma logic, so "91,5-95,5" reads as 91.5 and 95.5. */
      if (/^\d+([.,]\d+)?(-\d+([.,]\d+)?)+$/.test(token)) {
        issues.push("range");
        token.split("-").forEach((side) => {
          splitCommas(side, issues).forEach((part) => {
            const n = toNumber(part);
            if (n !== null) values.push(n);
          });
        });
        return;
      }

      splitCommas(token, issues).forEach((part) => {
        const n = toNumber(part);
        if (n !== null) values.push(n);
      });
    });

  return { values, issues: [...new Set(issues)] };
}

/* The old shape, kept for callers that only want the numbers. */
export const parseList = (text) => parseNumberList(text).values;

/* Read a field that should hold exactly one number, with the same comma sense
   as the lists: "91,5" is ninety-one and a half, "1,100" is eleven hundred.
   A bare parseFloat gets both wrong — it stops at the comma and returns 91
   and 1 — which is how a Spanish knitter's gauge used to lose its half stitch.
   Returns null when the text holds no number, or more than one. */
export const parseOne = (value) => {
  const { values } = parseNumberList(value);
  return values.length === 1 ? values[0] : null;
};

/* Unit conversion, used when someone flips the in/cm switch after typing.
   Goes through parseOne so a thousands-marked "1,100" converts as eleven
   hundred instead of collapsing to 1.1. A field that does not read as one
   clean number is left exactly as typed. */
export const convertOne = (value, f) => {
  const n = parseOne(value);
  return n !== null ? String(r1(f(n))) : value;
};

export const convertList = (text, f) => {
  const nums = parseList(text);
  return nums.length ? nums.map((n) => r1(f(n))).join(", ") : text;
};

export const inchesToCm = (n) => n * 2.54;
export const cmToInches = (n) => n / 2.54;
export const yardsToMetres = (n) => n * 0.9144;
export const metresToYards = (n) => n / 0.9144;

/* Gauge is quoted "per 4 in" or "per 10 cm", and knitters treat those as the
   same swatch. They are within 1.6% of each other (4 in is 10.16 cm), and the
   difference cancels entirely in the your-gauge-versus-pattern-gauge ratio.
   It does not cancel in the row-length maths, which multiplies by the swatch
   span, so this converts properly rather than pretending 4 in is 10 cm. */
export const gaugePer4inToPer10cm = (n) => (n * 10) / 10.16;
export const gaugePer10cmToPer4in = (n) => (n * 10.16) / 10;

/* A swatch is rarely counted over exactly 4 in or 10 cm. Knitters count
   whatever the swatch gives them — "22 stitches across 4¼ in" — and the
   per-swatch figure a pattern quotes is a rule of three away, which is the
   step beginners skip or get wrong. `counted` and `over` are raw field text,
   so a Spanish "4,25" reads as four and a quarter. Returns the gauge over
   `span`, or null while either field is empty, unreadable, or zero. */
export const swatchToGauge = (counted, over, span) => {
  const c = parseOne(counted);
  const o = parseOne(over);
  if (c === null || o === null) return null;
  return r1((c / o) * span);
};

/* A kitchen scale is the honest way to count part-used balls. Grams of yarn
   over the grams a full skein weighs is skeins — the same rule of three as
   the swatch — and it drops straight into the field the yarn card already
   reads, so nothing downstream ever has to know about grams. */
export const gramsToSkeins = (grams, gramsPerSkein) => {
  const g = parseOne(grams);
  const per = parseOne(gramsPerSkein);
  if (g === null || per === null) return null;
  return r1(g / per);
};
