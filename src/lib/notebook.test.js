import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { readNotebook, notebookInUnits, writeNotebook, clearNotebook, NOTEBOOK_KEY } from "./notebook.js";

/* Just enough of localStorage to read and write one key. */
const storage = (initial) => {
  const m = new Map(Object.entries(initial || {}));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) };
};
const saved = (obj) => storage({ [NOTEBOOK_KEY]: JSON.stringify(obj) });

describe("readNotebook: nothing on trust", () => {
  test("no notebook is null", () => {
    assert.equal(readNotebook(storage()), null);
  });

  test("a good notebook comes back validated and stringified", () => {
    const r = readNotebook(saved({ units: "in", craft: "knit", bust: 38, easeIdx: 2, myGauge: "21", skeins: 6 }));
    assert.equal(r.units, "in");
    assert.equal(r.craft, "knit");
    assert.equal(r.easeIdx, 2);
    assert.deepEqual(r.fields, { bust: "38", myGauge: "21", skeins: "6" });
  });

  test("an easeIdx of 7, furlongs and macramé are refused", () => {
    const r = readNotebook(saved({ units: "furlongs", craft: "macrame", easeIdx: 7, bust: "38" }));
    assert.equal(r.units, null);
    assert.equal(r.craft, null);
    assert.equal(r.easeIdx, null);
    assert.deepEqual(r.fields, { bust: "38" });
  });

  test("garbage in storage is treated as no notebook", () => {
    assert.equal(readNotebook(storage({ [NOTEBOOK_KEY]: "{not json" })), null);
    assert.equal(readNotebook(storage({ [NOTEBOOK_KEY]: "5" })), null);
  });

  test("a storage that throws is a storage that is not handy", () => {
    assert.equal(readNotebook({ getItem: () => { throw new Error("blocked"); } }), null);
  });
});

describe("notebookInUnits: the notebook follows the link's units", () => {
  const inches = { units: "in", craft: "knit", easeIdx: 2, fields: { bust: "38", myGauge: "21", myRowGauge: "26", perSkein: "220", skeins: "6" } };

  test("inches to centimetres, gauge via 10.16, skeins untouched", () => {
    const r = notebookInUnits(inches, "cm");
    assert.deepEqual(r.fields, { bust: "96.5", myGauge: "20.7", myRowGauge: "25.6", perSkein: "201.2", skeins: "6" });
    assert.equal(r.units, "cm");
  });

  test("the same units leave everything exactly as written", () => {
    assert.equal(notebookInUnits(inches, "in"), inches);
  });

  test("unknown units on either side mean no conversion", () => {
    assert.equal(notebookInUnits(inches, null), inches);
    assert.equal(notebookInUnits({ ...inches, units: null }, "cm").fields.bust, "38");
  });
});

describe("writeNotebook and clearNotebook", () => {
  test("what is written can be read back, and cleared", () => {
    const s = storage();
    writeNotebook(s, { units: "cm", craft: "crochet", easeIdx: 1, bust: "96", myGauge: "", myRowGauge: "", perSkein: "200", skeins: "3" });
    const r = readNotebook(s);
    assert.equal(r.units, "cm");
    assert.equal(r.craft, "crochet");
    assert.deepEqual(r.fields, { bust: "96", perSkein: "200", skeins: "3" });
    clearNotebook(s);
    assert.equal(readNotebook(s), null);
  });
});
