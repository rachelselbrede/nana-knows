/* ---------- Nana's notebook ----------
   "Nana, remember my numbers" writes the knitter's own fields — never the
   pattern's — to localStorage. Nothing read back is taken on trust: it may
   have been written by an older version of the app, or by a hand in the
   browser console. An easeIdx of 7 would send askNana past the end of the
   ease list and kill the button; a units value that is neither "in" nor "cm"
   would leave the toggle unselected and run conversions from a nonsense
   baseline. `storage` is handed in, so all of this is testable without a
   browser. */

import {
  convertOne,
  inchesToCm,
  cmToInches,
  yardsToMetres,
  metresToYards,
  gaugePer4inToPer10cm,
  gaugePer10cmToPer4in,
} from "./parse.js";

export const NOTEBOOK_KEY = "nana-notebook";

/* The fields that are the knitter's, in the order the form shows them. */
export const PERSONAL_FIELDS = ["bust", "myGauge", "myRowGauge", "perSkein", "skeins"];

export function readNotebook(storage) {
  let d;
  try {
    const saved = storage.getItem(NOTEBOOK_KEY);
    if (!saved) return null;
    d = JSON.parse(saved);
  } catch (e) {
    return null;
  }
  if (!d || typeof d !== "object") return null;
  const fields = {};
  PERSONAL_FIELDS.forEach((f) => {
    if (d[f]) fields[f] = String(d[f]);
  });
  return {
    units: d.units === "in" || d.units === "cm" ? d.units : null,
    craft: d.craft === "knit" || d.craft === "crochet" ? d.craft : null,
    easeIdx: Number.isInteger(d.easeIdx) && d.easeIdx >= 0 && d.easeIdx <= 4 ? d.easeIdx : null,
    fields,
  };
}

/* The notebook was written in whatever units were showing at the time. Bring
   its numbers into `units` — a 38 in bust arriving under a centimetre pattern
   must become 96.5 cm, not stay 38. A skein count is a count and never
   converts. Left alone when either side's units are unknown. */
export function notebookInUnits(notebook, units) {
  if (!notebook || !notebook.units || !units || notebook.units === units) return notebook;
  const toMetric = units === "cm";
  const gauge = toMetric ? gaugePer4inToPer10cm : gaugePer10cmToPer4in;
  const by = {
    bust: toMetric ? inchesToCm : cmToInches,
    myGauge: gauge,
    myRowGauge: gauge,
    perSkein: toMetric ? yardsToMetres : metresToYards,
  };
  const fields = {};
  Object.entries(notebook.fields).forEach(([f, v]) => {
    fields[f] = by[f] ? convertOne(v, by[f]) : v;
  });
  return { ...notebook, units, fields };
}

export function writeNotebook(storage, { units, craft, easeIdx, bust, myGauge, myRowGauge, perSkein, skeins }) {
  storage.setItem(
    NOTEBOOK_KEY,
    JSON.stringify({ units, craft, bust, easeIdx, myGauge, myRowGauge, perSkein, skeins })
  );
}

export function clearNotebook(storage) {
  storage.removeItem(NOTEBOOK_KEY);
}
