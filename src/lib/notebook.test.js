import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  readNotebook,
  openPage,
  personalOnly,
  notebookInUnits,
  writePage,
  forgetPage,
  markOpen,
  clearNotebook,
  cleanName,
  NOTEBOOK_KEY,
} from "./notebook.js";

/* Just enough of localStorage to read and write one key. */
const storage = (initial) => {
  const m = new Map(Object.entries(initial || {}));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, v),
    removeItem: (k) => m.delete(k),
  };
};
const saved = (obj) => storage({ [NOTEBOOK_KEY]: JSON.stringify(obj) });
const stored = (s) => JSON.parse(s.getItem(NOTEBOOK_KEY));
const names = (s) => readNotebook(s).pages.map((p) => p.name);

const blue = {
  name: "the blue cardigan",
  units: "in",
  craft: "knit",
  easeIdx: 2,
  patternGauge: "18",
  patternRowGauge: "24",
  sizesText: "32, 36, 40",
  yardsText: "900, 1000, 1100",
  bust: "38",
  myGauge: "21",
  myRowGauge: "26",
  perSkein: "220",
  skeins: "6",
};
const green = {
  name: "the green blanket",
  units: "cm",
  craft: "crochet",
  easeIdx: 3,
  sizesText: "100, 120",
  bust: "96",
  myGauge: "",
  myRowGauge: "",
  perSkein: "",
  skeins: "",
};

describe("readNotebook: nothing on trust", () => {
  test("no notebook is null", () => {
    assert.equal(readNotebook(storage()), null);
  });

  test("the old single page comes back as one unnamed page, open", () => {
    const r = readNotebook(
      saved({ units: "in", craft: "knit", bust: 38, easeIdx: 2, myGauge: "21", skeins: 6 }),
    );
    assert.equal(r.open, "");
    assert.equal(r.pages.length, 1);
    const p = r.pages[0];
    assert.equal(p.name, "");
    assert.equal(p.units, "in");
    assert.equal(p.craft, "knit");
    assert.equal(p.easeIdx, 2);
    assert.deepEqual(p.fields, { bust: "38", myGauge: "21", skeins: "6" });
  });

  test("a notebook of pages keeps their order, their names and the open one", () => {
    const r = readNotebook(saved({ open: "the blue cardigan", pages: [green, blue] }));
    assert.deepEqual(
      r.pages.map((p) => p.name),
      ["the green blanket", "the blue cardigan"],
    );
    assert.equal(r.open, "the blue cardigan");
    assert.deepEqual(r.pages[1].fields, {
      patternGauge: "18",
      patternRowGauge: "24",
      sizesText: "32, 36, 40",
      yardsText: "900, 1000, 1100",
      bust: "38",
      myGauge: "21",
      myRowGauge: "26",
      perSkein: "220",
      skeins: "6",
    });
    /* Empty strings are not fields. */
    assert.deepEqual(r.pages[0].fields, { sizesText: "100, 120", bust: "96" });
  });

  test("an open name that matches no page falls back to the first", () => {
    assert.equal(
      readNotebook(saved({ open: "the red hat", pages: [green, blue] })).open,
      "the green blanket",
    );
    assert.equal(readNotebook(saved({ pages: [green] })).open, "the green blanket");
  });

  test("two pages with one name: the later one is dropped", () => {
    const r = readNotebook(saved({ pages: [blue, { ...blue, bust: "40" }] }));
    assert.equal(r.pages.length, 1);
    assert.equal(r.pages[0].fields.bust, "38");
  });

  test("an easeIdx of 7, furlongs and macramé are refused", () => {
    const r = openPage(
      readNotebook(saved({ units: "furlongs", craft: "macrame", easeIdx: 7, bust: "38" })),
    );
    assert.equal(r.units, null);
    assert.equal(r.craft, null);
    assert.equal(r.easeIdx, null);
    assert.deepEqual(r.fields, { bust: "38" });
  });

  test("names are trimmed and capped, and a missing name is empty", () => {
    assert.equal(cleanName("  the blue cardigan  "), "the blue cardigan");
    assert.equal(cleanName("x".repeat(80)).length, 40);
    assert.equal(cleanName(undefined), "");
    assert.equal(
      readNotebook(saved({ pages: [{ ...blue, name: "  padded  " }] })).pages[0].name,
      "padded",
    );
  });

  test("garbage in storage is treated as no notebook", () => {
    assert.equal(readNotebook(storage({ [NOTEBOOK_KEY]: "{not json" })), null);
    assert.equal(readNotebook(storage({ [NOTEBOOK_KEY]: "5" })), null);
    assert.equal(readNotebook(storage({ [NOTEBOOK_KEY]: "[]" })), null);
    assert.equal(readNotebook(saved({ pages: [] })), null);
    assert.equal(readNotebook(saved({ pages: ["no", 5, null] })), null);
  });

  test("a storage that throws is a storage that is not handy", () => {
    assert.equal(
      readNotebook({
        getItem: () => {
          throw new Error("blocked");
        },
      }),
      null,
    );
  });
});

describe("openPage and personalOnly", () => {
  test("the open page, else the first, else nothing", () => {
    assert.equal(
      openPage(readNotebook(saved({ open: "the blue cardigan", pages: [green, blue] }))).name,
      "the blue cardigan",
    );
    assert.equal(openPage(readNotebook(saved({ pages: [green, blue] }))).name, "the green blanket");
    assert.equal(openPage(null), null);
  });

  test("personalOnly keeps the knitter's fields and drops the pattern's", () => {
    const p = personalOnly(openPage(readNotebook(saved({ pages: [blue] }))));
    assert.deepEqual(p.fields, {
      bust: "38",
      myGauge: "21",
      myRowGauge: "26",
      perSkein: "220",
      skeins: "6",
    });
    assert.equal(p.units, "in");
    assert.equal(personalOnly(null), null);
  });
});

describe("notebookInUnits: the page follows the link's units", () => {
  const inches = {
    name: "",
    units: "in",
    craft: "knit",
    easeIdx: 2,
    fields: { bust: "38", myGauge: "21", myRowGauge: "26", perSkein: "220", skeins: "6" },
  };

  test("inches to centimetres, gauge via 10.16, skeins untouched", () => {
    const r = notebookInUnits(inches, "cm");
    assert.deepEqual(r.fields, {
      bust: "96.5",
      myGauge: "20.7",
      myRowGauge: "25.6",
      perSkein: "201.2",
      skeins: "6",
    });
    assert.equal(r.units, "cm");
  });

  test("a whole page converts its pattern too, lists and all", () => {
    const whole = {
      ...inches,
      fields: {
        ...inches.fields,
        patternGauge: "18",
        patternRowGauge: "24",
        sizesText: "32, 36",
        yardsText: "900, 1000",
      },
    };
    const r = notebookInUnits(whole, "cm");
    assert.equal(r.fields.patternGauge, "17.7");
    assert.equal(r.fields.patternRowGauge, "23.6");
    assert.equal(r.fields.sizesText, "81.3, 91.4");
    assert.equal(r.fields.yardsText, "823, 914.4");
  });

  test("the same units leave everything exactly as written", () => {
    assert.equal(notebookInUnits(inches, "in"), inches);
  });

  test("unknown units on either side mean no conversion", () => {
    assert.equal(notebookInUnits(inches, null), inches);
    assert.equal(notebookInUnits({ ...inches, units: null }, "cm").fields.bust, "38");
  });
});

describe("writePage: save, save as, and naming the old page", () => {
  test("what is written can be read back whole, and becomes the open page", () => {
    const s = storage();
    writePage(s, green);
    const r = readNotebook(s);
    assert.equal(r.open, "the green blanket");
    assert.equal(r.pages[0].craft, "crochet");
    assert.deepEqual(r.pages[0].fields, { sizesText: "100, 120", bust: "96" });
  });

  test("a second name is a second page; the same name replaces", () => {
    const s = storage();
    writePage(s, blue, null);
    writePage(s, green, "the blue cardigan");
    assert.deepEqual(names(s), ["the blue cardigan", "the green blanket"]);
    writePage(s, { ...blue, bust: "40" }, "the green blanket");
    assert.deepEqual(names(s), ["the blue cardigan", "the green blanket"]);
    assert.equal(readNotebook(s).pages[0].fields.bust, "40");
    assert.equal(readNotebook(s).open, "the blue cardigan");
  });

  test("naming the unnamed page you came from renames it rather than copying it", () => {
    const s = saved({ units: "in", craft: "knit", bust: "38", easeIdx: 2 });
    writePage(s, { ...blue }, "");
    assert.deepEqual(names(s), ["the blue cardigan"]);
  });

  test("but saving without a name while a named page is open adds an unnamed page", () => {
    const s = storage();
    writePage(s, blue, null);
    writePage(s, { ...green, name: "" }, "the blue cardigan");
    assert.deepEqual(names(s), ["the blue cardigan", ""]);
    assert.equal(readNotebook(s).open, "");
  });

  test("a notebook that will not parse does not stop a save", () => {
    const s = storage({ [NOTEBOOK_KEY]: "{not json" });
    writePage(s, blue);
    assert.deepEqual(names(s), ["the blue cardigan"]);
  });

  test("the stored shape is a list of flat pages", () => {
    const s = storage();
    writePage(s, blue);
    const d = stored(s);
    assert.deepEqual(Object.keys(d), ["open", "pages"]);
    assert.equal(d.pages[0].bust, "38");
    assert.equal(d.pages[0].name, "the blue cardigan");
  });
});

describe("forgetPage, markOpen, clearNotebook", () => {
  test("tearing out the open page opens the first one left", () => {
    const s = saved({ open: "the blue cardigan", pages: [green, blue] });
    forgetPage(s, "the blue cardigan");
    assert.deepEqual(names(s), ["the green blanket"]);
    assert.equal(readNotebook(s).open, "the green blanket");
  });

  test("tearing out another page leaves the open one open", () => {
    const s = saved({ open: "the blue cardigan", pages: [green, blue] });
    forgetPage(s, "the green blanket");
    assert.equal(readNotebook(s).open, "the blue cardigan");
  });

  test("the last page going takes the notebook with it", () => {
    const s = saved({ pages: [blue] });
    forgetPage(s, "the blue cardigan");
    assert.equal(s.getItem(NOTEBOOK_KEY), null);
  });

  test("markOpen remembers the page for next time, and ignores a name it has no page for", () => {
    const s = saved({ open: "the blue cardigan", pages: [green, blue] });
    markOpen(s, "the green blanket");
    assert.equal(readNotebook(s).open, "the green blanket");
    markOpen(s, "the red hat");
    assert.equal(readNotebook(s).open, "the green blanket");
  });

  test("clearNotebook forgets everything", () => {
    const s = saved({ pages: [green, blue] });
    clearNotebook(s);
    assert.equal(readNotebook(s), null);
  });
});
