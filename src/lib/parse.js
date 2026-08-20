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
     "100,200,300" must not be caught by this, so require at least one leading
     group shorter than three digits. */
  const even = parts.length % 2 === 0;
  const leads = parts.filter((_, i) => i % 2 === 0);
  const tails = parts.filter((_, i) => i % 2 === 1);
  const looksThousands =
    even &&
    leads.every((p) => /^\d{1,3}$/.test(p)) &&
    tails.every((p) => /^\d{3}$/.test(p)) &&
    leads.some((p) => p.length < 3);

  if (looksThousands) {
    issues.push("thousands");
    return leads.map((lead, i) => lead + tails[i]);
  }
  return parts;
}

/* Turn a free-typed list into numbers, with a note of anything Nana had to
   guess at. Returns { values, issues }. */
export function parseNumberList(text) {
  const issues = [];
  const values = [];

  String(text || "")
    /* En dashes and em dashes are ranges too, however they were typed. */
    .replace(/[\u2012-\u2015\u2212]/g, "-")
    /* A comma before a space always breaks a list, whatever else commas do. */
    .replace(/,(?=\s)/g, " ")
    .split(/[;\s]+/)
    .filter(Boolean)
    .forEach((token) => {
      /* "32-36" used to become 3236: finite, positive, and nonsense, so nothing
         downstream ever objected. Treat a dash between two numbers as a break
         and flag it, since only the knitter knows if she meant a range. */
      if (/^\d+(\.\d+)?-\d+(\.\d+)?$/.test(token)) {
        issues.push("range");
        token.split("-").forEach((p) => {
          const n = toNumber(p);
          if (n !== null) values.push(n);
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

/* Unit conversion, used when someone flips the in/cm switch after typing.
   Gauge is deliberately left alone; see convertGauge below for why. */
export const convertOne = (value, f) => {
  const n = parseFloat(String(value).replace(",", "."));
  return isFinite(n) && n > 0 ? String(r1(f(n))) : value;
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
