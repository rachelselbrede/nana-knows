/* ---------- Nana's notebook ----------
   "Nana, remember my numbers" writes the form to localStorage, one page per
   project, each with a name. Nothing read back is taken on trust: it may
   have been written by an older version of the app, or by a hand in the
   browser console. An easeIdx of 7 would send askNana past the end of the
   ease list and kill the button; a units value that is neither "in" nor "cm"
   would leave the toggle unselected and run conversions from a nonsense
   baseline. `storage` is handed in, so all of this is testable without a
   browser.

   The notebook used to be one page with no name, holding only the knitter's
   own fields. That shape is still read, and comes back as a single unnamed
   page, so nobody's saved measurements vanish on the day the picker
   appears. */

import {
  convertOne,
  convertList,
  inchesToCm,
  cmToInches,
  yardsToMetres,
  metresToYards,
  gaugePer4inToPer10cm,
  gaugePer10cmToPer4in,
} from "./parse.js";

export const NOTEBOOK_KEY = "nana-notebook";

/* The fields that are the knitter's, in the order the form shows them. These
   are the only ones that ever leave the notebook while a shared link is
   open. */
export const PERSONAL_FIELDS = ["bust", "myGauge", "myRowGauge", "perSkein", "skeins"];
/* The pattern's, which a page holds too, so a project comes back whole. */
export const PATTERN_FIELDS = ["patternGauge", "patternRowGauge", "sizesText", "yardsText"];
export const PAGE_FIELDS = [...PATTERN_FIELDS, ...PERSONAL_FIELDS];

/* A name is a label on a pill, not a paragraph. */
export const MAX_NAME = 40;
export const cleanName = (name) => String(name ?? "").trim().slice(0, MAX_NAME);

/* One page, validated. Whatever is not a legal value is dropped rather than
   repaired, and every field comes back a string, because that is what the
   inputs hold. */
function readPage(d) {
  if (!d || typeof d !== "object" || Array.isArray(d)) return null;
  const fields = {};
  PAGE_FIELDS.forEach((f) => {
    if (d[f] != null && String(d[f]).trim() !== "") fields[f] = String(d[f]);
  });
  return {
    name: cleanName(d.name),
    units: d.units === "in" || d.units === "cm" ? d.units : null,
    craft: d.craft === "knit" || d.craft === "crochet" ? d.craft : null,
    easeIdx: Number.isInteger(d.easeIdx) && d.easeIdx >= 0 && d.easeIdx <= 4 ? d.easeIdx : null,
    fields,
  };
}

/* The whole notebook: `{ open, pages }` with at least one page, or null. Two
   pages cannot share a name; a later duplicate is dropped. `open` is the
   page the form last showed, and falls back to the first. */
export function readNotebook(storage) {
  let d;
  try {
    const saved = storage.getItem(NOTEBOOK_KEY);
    if (!saved) return null;
    d = JSON.parse(saved);
  } catch (e) {
    return null;
  }
  if (!d || typeof d !== "object" || Array.isArray(d)) return null;
  /* The old shape was one flat page with no list around it. */
  const raw = Array.isArray(d.pages) ? d.pages : [d];
  const seen = new Set();
  const pages = [];
  raw.forEach((r) => {
    const page = readPage(r);
    if (!page || seen.has(page.name)) return;
    seen.add(page.name);
    pages.push(page);
  });
  if (pages.length === 0) return null;
  const open = cleanName(d.open);
  return { open: typeof d.open === "string" && seen.has(open) ? open : pages[0].name, pages };
}

/* The page the form should come from. */
export const openPage = (notebook) =>
  notebook ? (notebook.pages.find((p) => p.name === notebook.open) ?? notebook.pages[0]) : null;

/* The same page with the pattern's numbers left out. This is all a page may
   contribute while a shared link is open: the link's pattern must not be
   quietly completed from a different one. */
export function personalOnly(page) {
  if (!page) return null;
  const fields = {};
  PERSONAL_FIELDS.forEach((f) => {
    if (page.fields[f] != null) fields[f] = page.fields[f];
  });
  return { ...page, fields };
}

/* A page was written in whatever units were showing at the time. Bring its
   numbers into `units` — a 38 in bust arriving under a centimetre pattern
   must become 96.5 cm, not stay 38. A skein count is a count and never
   converts. Left alone when either side's units are unknown. */
export function notebookInUnits(page, units) {
  if (!page || !page.units || !units || page.units === units) return page;
  const toMetric = units === "cm";
  const len = toMetric ? inchesToCm : cmToInches;
  const yarn = toMetric ? yardsToMetres : metresToYards;
  const gauge = toMetric ? gaugePer4inToPer10cm : gaugePer10cmToPer4in;
  const by = {
    bust: (v) => convertOne(v, len),
    myGauge: (v) => convertOne(v, gauge),
    myRowGauge: (v) => convertOne(v, gauge),
    perSkein: (v) => convertOne(v, yarn),
    patternGauge: (v) => convertOne(v, gauge),
    patternRowGauge: (v) => convertOne(v, gauge),
    sizesText: (v) => convertList(v, len),
    yardsText: (v) => convertList(v, yarn),
  };
  const fields = {};
  Object.entries(page.fields).forEach(([f, v]) => {
    fields[f] = by[f] ? by[f](v) : v;
  });
  return { ...page, units, fields };
}

/* Pages are stored flat — name, units, craft, ease and the fields side by
   side — which is also the old single-page shape, so one reader serves
   both. */
const flat = (p) => ({ name: p.name, units: p.units, craft: p.craft, easeIdx: p.easeIdx, ...p.fields });

/* Whatever is there, tolerantly: one bad byte in storage must not stop a
   save. */
const current = (storage) => readNotebook(storage) ?? { open: null, pages: [] };

const store = (storage, open, pages) => storage.setItem(NOTEBOOK_KEY, JSON.stringify({ open, pages }));

/* Write a page under its name, replacing a page of that name if there is
   one, and make it the open page. `wasOpen` is the name of the page the form
   was loaded from: when that is the unnamed page — the old single-page
   notebook — and the knitter now gives it a name, she is naming it, not
   copying it, so the unnamed page is the one replaced. */
export function writePage(storage, page, wasOpen = null) {
  const name = cleanName(page.name);
  const pages = current(storage).pages.map(flat);
  let idx = pages.findIndex((p) => p.name === name);
  if (idx < 0 && wasOpen === "" && name !== "") idx = pages.findIndex((p) => p.name === "");
  const entry = { ...page, name };
  if (idx < 0) pages.push(entry);
  else pages[idx] = entry;
  store(storage, name, pages);
}

/* Tear one page out. The last page going takes the notebook with it. */
export function forgetPage(storage, name) {
  const gone = cleanName(name);
  const nb = current(storage);
  const pages = nb.pages.filter((p) => p.name !== gone).map(flat);
  if (pages.length === 0) {
    storage.removeItem(NOTEBOOK_KEY);
    return;
  }
  store(storage, nb.open === gone ? pages[0].name : nb.open, pages);
}

/* Note which page the form is showing, so the next visit opens the same one. */
export function markOpen(storage, name) {
  const nb = current(storage);
  if (!nb.pages.some((p) => p.name === name)) return;
  store(storage, name, nb.pages.map(flat));
}

export function clearNotebook(storage) {
  storage.removeItem(NOTEBOOK_KEY);
}
