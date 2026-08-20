import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  parseNumberList,
  parseList,
  convertOne,
  convertList,
  inchesToCm,
  cmToInches,
  yardsToMetres,
  gaugePer4inToPer10cm,
  gaugePer10cmToPer4in,
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

  test("text Nana cannot read is left exactly as typed", () => {
    assert.equal(convertOne("about 38", inchesToCm), "about 38");
  });

  test("a whole list converts and comes back comma separated", () => {
    assert.equal(convertList("32, 36", inchesToCm), "81.3, 91.4");
  });

  test("yards to metres", () => {
    assert.equal(convertOne("1000", yardsToMetres), "914.4");
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
