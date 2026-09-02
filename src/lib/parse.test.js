import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  parseNumberList,
  parseList,
  parseOne,
  convertOne,
  convertList,
  inchesToCm,
  cmToInches,
  yardsToMetres,
  gaugePer4inToPer10cm,
  gaugePer10cmToPer4in,
  swatchToGauge,
  r1,
} from "./parse.js";

describe("parseNumberList: the plain cases", () => {
  const cases = [
    ["32, 36, 40", [32, 36, 40]],
    ["32 36 40", [32, 36, 40]],
    ["32; 36; 40", [32, 36, 40]],
    ["36", [36]],
    ["36 in", [36]],
    ["36in", [36]],
    ["1200 yds", [1200]],
    ["", []],
    ["   ", []],
    ["nonsense", []],
    ["0", []],
  ];
  for (const [input, expected] of cases) {
    test(JSON.stringify(input), () => {
      assert.deepEqual(parseList(input), expected);
    });
  }
});

describe("parseNumberList: the comma, which means three different things", () => {
  test('"91,5" is a European decimal', () => {
    assert.deepEqual(parseList("91,5"), [91.5]);
  });

  test('"1,100" is an American thousands mark', () => {
    assert.deepEqual(parseList("1,100"), [1100]);
  });

  test('"32,36" is a list, not thirty-two point three six', () => {
    assert.deepEqual(parseList("32,36"), [32, 36]);
  });

  test('"32.5,36.5" keeps both sizes', () => {
    /* The original parser returned [32.5] here and lost a size in silence,
       which is the worst thing a parser in this app can do. */
    assert.deepEqual(parseList("32.5,36.5"), [32.5, 36.5]);
  });

  test('"900,1000" is a list, because no thousands mark has four digits', () => {
    assert.deepEqual(parseList("900,1000"), [900, 1000]);
  });

  test('"1,100, 1,250" is two thousands-marked numbers', () => {
    assert.deepEqual(parseList("1,100, 1,250"), [1100, 1250]);
  });

  test('"1,100,1,250" is two thousands-marked numbers even without the space', () => {
    assert.deepEqual(parseList("1,100,1,250"), [1100, 1250]);
  });

  test('"100,200,300" is a plain list, not one enormous number', () => {
    assert.deepEqual(parseList("100,200,300"), [100, 200, 300]);
  });

  test('"1.100,5" is European: dots group, comma decides the decimal', () => {
    assert.deepEqual(parseList("1.100,5"), [1100.5]);
  });

  test("a comma before a space always breaks the list", () => {
    assert.deepEqual(parseList("1, 100"), [1, 100]);
  });

  test('"97,102,107,112" is a cm size list, not two enormous numbers', () => {
    /* This is exactly what a metric size run looks like typed on a phone with
       no spaces. It used to match the thousands rule and become [97102, 107112]
       because only one lead had to be short; now every lead must be. */
    assert.deepEqual(parseList("97,102,107,112"), [97, 102, 107, 112]);
  });
});

describe("parseNumberList: fractions, the way knitters actually write halves", () => {
  test('"36 1/2" is thirty-six and a half', () => {
    /* toNumber used to strip the slash and read "1/2" as 12 — so the echo said
       "Nana read: 36, 12" and the knitter was one glance from a size 12. */
    const r = parseNumberList("36 1/2");
    assert.deepEqual(r.values, [36.5]);
    assert.deepEqual(r.issues, ["fraction"]);
  });

  test('"36½" the unicode way', () => {
    assert.deepEqual(parseList("36½"), [36.5]);
  });

  test('"36 ½" with a space before the half', () => {
    assert.deepEqual(parseList("36 ½"), [36.5]);
  });

  test("a fraction folds into the list around it", () => {
    assert.deepEqual(parseList("32, 36 1/2, 40"), [32, 36.5, 40]);
  });

  test("a lone fraction stands on its own", () => {
    assert.deepEqual(parseList("1/2"), [0.5]);
  });
});

describe("parseNumberList: ranges", () => {
  test('"32-36" is two numbers, not 3236', () => {
    /* The original parser stripped the dash and produced 3236 — finite and
       positive, so every check downstream waved it through. */
    assert.deepEqual(parseList("32-36"), [32, 36]);
  });

  test("an en dash is a dash too", () => {
    assert.deepEqual(parseList("32\u201336"), [32, 36]);
  });

  test("a range is reported so the interface can say what it assumed", () => {
    assert.deepEqual(parseNumberList("32-36").issues, ["range"]);
  });

  test('"32-36-40" breaks at every dash, not just the first', () => {
    /* Three sizes pasted with dashes used to fail the two-number range test,
       fall through to toNumber, and come out as 323640 — the very number the
       range rule was written to prevent. */
    const r = parseNumberList("32-36-40");
    assert.deepEqual(r.values, [32, 36, 40]);
    assert.deepEqual(r.issues, ["range"]);
  });

  test('"91,5-95,5" is a European range, not three splinters', () => {
    /* The comma-decimal variant used to skip the range rule, split at the
       commas, and produce [91, 595, 5] with no flag at all. */
    assert.deepEqual(parseList("91,5-95,5"), [91.5, 95.5]);
  });

  test('"1,100-1,250" reads its thousands marks before its dash', () => {
    assert.deepEqual(parseList("1,100-1,250"), [1100, 1250]);
  });
});

describe("parseNumberList: issues are reported, not swallowed", () => {
  test("an unambiguous list raises nothing", () => {
    assert.deepEqual(parseNumberList("32, 36, 40").issues, []);
  });

  test("a thousands guess is flagged", () => {
    assert.deepEqual(parseNumberList("1,100").issues, ["thousands"]);
  });

  test("issues are de-duplicated", () => {
    assert.deepEqual(parseNumberList("1,100 2,200").issues, ["thousands"]);
  });

  test("a European decimal needs no flag", () => {
    assert.deepEqual(parseNumberList("91,5").issues, []);
  });
});

describe("parseNumberList: rubbish in, nothing out", () => {
  test("negative numbers are not sizes", () => {
    assert.deepEqual(parseList("-4"), [4], "the minus is stripped, not honoured");
  });

  test("zero is dropped", () => {
    assert.deepEqual(parseList("0, 36"), [36]);
  });

  test("order is preserved, because yardage lines up with sizes by position", () => {
    assert.deepEqual(parseList("40, 32, 36"), [40, 32, 36]);
  });
});

describe("unit conversion", () => {
  test("inches to centimetres, to one decimal", () => {
    assert.equal(convertOne("38", inchesToCm), "96.5");
  });

  test("centimetres back to inches", () => {
    assert.equal(convertOne("96.5", cmToInches), "38");
  });

  test("a round trip lands within a tenth", () => {
    const there = convertOne("38", inchesToCm);
    const back = parseFloat(convertOne(there, cmToInches));
    assert.ok(Math.abs(back - 38) <= 0.1, `got ${back}`);
  });

  test("an empty field stays empty", () => {
    assert.equal(convertOne("", inchesToCm), "");
  });

  test("one number inside hedging words still converts", () => {
    /* "about 38" used to be left exactly as typed — which sounds respectful
       until the label under it flips to cm and the 38 quietly becomes a
       38 cm reading. If the field holds exactly one number, the number must
       follow the units. */
    assert.equal(convertOne("about 38", inchesToCm), "96.5");
  });

  test("text with no single number in it is left exactly as typed", () => {
    assert.equal(convertOne("soon", inchesToCm), "soon");
    assert.equal(convertOne("32, 36", inchesToCm), "32, 36");
  });

  test('"1,100" converts as eleven hundred, not one point one', () => {
    /* The old convertOne swapped the comma for a dot and turned a
       thousands-marked skein count into 1.1 — a destructive edit of the
       knitter's own field on a unit flip. */
    assert.equal(convertOne("1,100", yardsToMetres), "1005.8");
  });

  test('"91,5" converts as ninety-one and a half', () => {
    assert.equal(convertOne("91,5", cmToInches), "36");
  });

  test("a whole list converts and comes back comma separated", () => {
    assert.equal(convertList("32, 36", inchesToCm), "81.3, 91.4");
  });

  test("yards to metres", () => {
    assert.equal(convertOne("1000", yardsToMetres), "914.4");
  });
});

describe("parseOne: fields that should hold exactly one number", () => {
  test("a plain number", () => {
    assert.equal(parseOne("38"), 38);
  });

  test("a European decimal keeps its half", () => {
    /* parseFloat("17,5") stops at the comma and returns 17, which cost a
       Spanish knitter half a stitch of gauge. parseOne knows the comma rules. */
    assert.equal(parseOne("17,5"), 17.5);
  });

  test("a thousands mark reads as thousands", () => {
    assert.equal(parseOne("1,100"), 1100);
  });

  test("a fraction reads as its decimal", () => {
    assert.equal(parseOne("36 1/2"), 36.5);
  });

  test("empty and unreadable fields are null", () => {
    assert.equal(parseOne(""), null);
    assert.equal(parseOne("soon"), null);
  });

  test("two numbers are not one", () => {
    assert.equal(parseOne("32, 36"), null);
  });
});

describe("gauge conversion: 4 in is 10.16 cm, not 10", () => {
  test("stitches per 4 in convert to slightly fewer per 10 cm", () => {
    assert.equal(r1(gaugePer4inToPer10cm(18)), 17.7);
  });

  test("and back again", () => {
    assert.ok(Math.abs(gaugePer10cmToPer4in(gaugePer4inToPer10cm(18)) - 18) < 1e-9);
  });
});

describe("swatchToGauge: from a counted swatch to the gauge a pattern quotes", () => {
  test("22 stitches across 4.25 in is 20.7 per 4 in", () => {
    assert.equal(swatchToGauge("22", "4.25", 4), 20.7);
  });

  test("counted over exactly the span, the number comes back as typed", () => {
    assert.equal(swatchToGauge("18", "4", 4), 18);
    assert.equal(swatchToGauge("22", "10", 10), 22);
  });

  test("a European decimal in the width reads as a decimal", () => {
    assert.equal(swatchToGauge("24", "10,5", 10), 22.9);
  });

  test("rows work the same way", () => {
    assert.equal(swatchToGauge("30", "4.5", 4), 26.7);
  });

  test("half stitches count", () => {
    assert.equal(swatchToGauge("22.5", "4", 4), 22.5);
  });

  test("waits until both numbers are there", () => {
    assert.equal(swatchToGauge("", "4", 4), null);
    assert.equal(swatchToGauge("22", "", 4), null);
    assert.equal(swatchToGauge("22", "0", 4), null);
    assert.equal(swatchToGauge("lots", "4", 4), null);
  });
});
