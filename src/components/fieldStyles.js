import { C } from "../palette.js";
import { SANS } from "../type.js";

/* ---------- shared field styles ----------
   The same label, input and table-header look on every card, kept out of the
   components so the three cards and the results table cannot drift apart. */
/* Sentence case, bold, in the sans: a label should read like a note on a
   pattern, not like a heading on a dashboard. */
export const labelStyle = {
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: 13.5,
  color: C.label,
};
export const inputStyle = {
  background: C.field,
  border: `2px solid ${C.line}`,
  borderRadius: 12,
  color: C.espresso,
  fontFamily: SANS,
};
/* Table headers wear the label look a size smaller. */
export const thStyle = {
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: 12.5,
  color: C.label,
};
