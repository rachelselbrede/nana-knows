import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { readShareLink, buildShareUrl, MAX_PARAM } from "./share.js";

const HREF = "https://rachelselbrede.github.io/nana-knows/?old=1";

describe("readShareLink: what a link says, and what it does not", () => {
  test("no share params is no link, whatever else is stuck on", () => {
    assert.equal(readShareLink(""), null);
    assert.equal(readShareLink("?fbclid=abc&utm_source=x"), null);
  });

  test("a person's project: fields, units, craft, ease, and hasPersonal", () => {
    const r = readShareLink("?s=32,36,40&y=900,1000,1100&b=38&mg=21&u=cm&c=crochet&e=3&lang=es");
    assert.deepEqual(r.fields, { sizesText: "32,36,40", yardsText: "900,1000,1100", bust: "38", myGauge: "21" });
    assert.equal(r.units, "cm");
    assert.equal(r.craft, "crochet");
    assert.equal(r.easeIdx, 3);
    assert.equal(r.hasPersonal, true);
  });

  test("a designer's pattern: no personal fields, so the notebook may open", () => {
    const r = readShareLink("?s=32,36,40&y=900,1000,1100&pg=18&prg=24&u=in&c=knit");
    assert.equal(r.hasPersonal, false);
    assert.equal(r.easeIdx, null);
    assert.deepEqual(Object.keys(r.fields), ["patternGauge", "patternRowGauge", "sizesText", "yardsText"]);
  });

  test("ease alone counts as personal", () => {
    assert.equal(readShareLink("?s=32&e=1").hasPersonal, true);
  });

  test("nonsense units, craft and ease are refused, not guessed at", () => {
    const r = readShareLink("?s=32&u=furlongs&c=macrame&e=7");
    assert.equal(r.units, null);
    assert.equal(r.craft, "knit", "an unknown craft falls back to knitting, as the toggle would");
    assert.equal(r.easeIdx, null);
  });

  test("empty params are not fields", () => {
    assert.deepEqual(readShareLink("?s=32&b=").fields, { sizesText: "32" });
  });

  test("a 5,000-character value arrives capped", () => {
    const r = readShareLink("?b=" + "9".repeat(5000));
    assert.equal(r.fields.bust.length, MAX_PARAM);
  });
});

describe("buildShareUrl: the link Nana hands out", () => {
  const fields = { patternGauge: "18", patternRowGauge: "", sizesText: "32, 36", yardsText: "", bust: "38", myGauge: "", myRowGauge: "", perSkein: "", skeins: "" };

  test("carries language, units and craft, and only the filled fields", () => {
    const url = new URL(buildShareUrl(HREF, { lang: "es", units: "in", craft: "knit", easeIdx: 2, fields }));
    assert.equal(url.searchParams.get("lang"), "es");
    assert.equal(url.searchParams.get("u"), "in");
    assert.equal(url.searchParams.get("c"), "knit");
    assert.equal(url.searchParams.get("s"), "32, 36");
    assert.equal(url.searchParams.get("pg"), "18");
    assert.equal(url.searchParams.has("y"), false);
    assert.equal(url.searchParams.has("old"), false, "the old query is replaced, not appended to");
  });

  test("the default ease is left out; any other rides along", () => {
    assert.equal(new URL(buildShareUrl(HREF, { lang: "en", units: "in", craft: "knit", easeIdx: 2, fields })).searchParams.has("e"), false);
    assert.equal(new URL(buildShareUrl(HREF, { lang: "en", units: "in", craft: "knit", easeIdx: 4, fields })).searchParams.get("e"), "4");
  });

  test("what is built can be read back", () => {
    const url = buildShareUrl(HREF, { lang: "en", units: "cm", craft: "crochet", easeIdx: 0, fields });
    const r = readShareLink(new URL(url).search);
    assert.deepEqual(r.fields, { patternGauge: "18", sizesText: "32, 36", bust: "38" });
    assert.equal(r.units, "cm");
    assert.equal(r.craft, "crochet");
    assert.equal(r.easeIdx, 0);
    assert.equal(r.hasPersonal, true);
  });
});
