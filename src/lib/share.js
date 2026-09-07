/* ---------- shared links ----------
   Every field can ride in the URL; the link itself is the storage, and no
   server ever sees it. Nothing here touches React or the window: the
   component hands in a search string and gets back what to set, which is
   what lets the link rules be tested. */

/* The project fields Nana can carry in a shared link, keyed short to keep
   URLs tidy. The order here is the order they appear in a built link. */
export const SHARE_TEXT_KEYS = {
  pg: "patternGauge",
  prg: "patternRowGauge",
  s: "sizesText",
  y: "yardsText",
  b: "bust",
  mg: "myGauge",
  mrg: "myRowGauge",
  ps: "perSkein",
  sk: "skeins",
};

/* Only these params mean "someone shared a project". Anything else — a
   ?fbclid=, a ?utm_source= stuck on by whichever platform relayed the link —
   must not be allowed to talk Nana out of opening her notebook. */
export const SHARE_KEYS = new Set(["u", "c", "e", ...Object.keys(SHARE_TEXT_KEYS)]);

/* The params that are the knitter's own. A link carrying any of these was
   shared by a person, numbers and all, and must not be mixed with the
   notebook. A link carrying only the pattern's numbers — a designer's "ask
   Nana which size" link — is exactly what the notebook is for. */
export const PERSONAL_KEYS = new Set(["b", "mg", "mrg", "ps", "sk", "e"]);

/* A shared link is untrusted text. React escapes it, so the risk was never
   injection — it was a 50 kB ?b= value pasted into a field and rendered. A
   dozen sizes with spaces run to about 70 characters; nothing honest is
   longer than this. */
export const MAX_PARAM = 120;

/* Read a shared link. Null when the search string carries no share params at
   all; otherwise everything the link says, validated — units and craft only
   when legal, ease only when in range, text fields capped — plus whether the
   link is a person's project (`hasPersonal`) or just a pattern. */
export function readShareLink(search) {
  const p = new URLSearchParams(search || "");
  const keys = [...p.keys()];
  if (!keys.some((k) => SHARE_KEYS.has(k))) return null;

  const u = p.get("u");
  const c = p.get("c");
  const e = p.get("e");
  const easeIdx = Number(e);
  const fields = {};
  Object.entries(SHARE_TEXT_KEYS).forEach(([key, field]) => {
    const v = p.get(key);
    if (v != null && v !== "") fields[field] = v.slice(0, MAX_PARAM);
  });
  return {
    units: u === "cm" ? "cm" : u === "in" ? "in" : null,
    craft: c ? (c === "crochet" ? "crochet" : "knit") : null,
    easeIdx: e != null && e !== "" && Number.isInteger(easeIdx) && easeIdx >= 0 && easeIdx <= 4 ? easeIdx : null,
    fields,
    hasPersonal: keys.some((k) => PERSONAL_KEYS.has(k)),
  };
}

/* Build a link that carries the current inputs. Always includes the
   language: it used to be copied from the URL, which only has ?lang once the
   toggle has been clicked — so a Spanish speaker whose language came from
   her browser shared links that opened in English. Units and craft ride
   along too, so numbers are never misread; the default ease is left out, and
   so are empty fields. */
export function buildShareUrl(href, { lang, units, craft, easeIdx, fields }) {
  const url = new URL(href);
  const fresh = new URLSearchParams();
  fresh.set("lang", lang);
  fresh.set("u", units);
  fresh.set("c", craft);
  if (easeIdx !== 2) fresh.set("e", String(easeIdx));
  Object.entries(SHARE_TEXT_KEYS).forEach(([k, field]) => {
    const v = fields[field];
    if (v != null && String(v).trim() !== "") fresh.set(k, v);
  });
  url.search = fresh.toString();
  return url.toString();
}
