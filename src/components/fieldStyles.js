import { C } from "../palette.js";

/* ---------- shared field styles ----------
   The same label, input and table-header look on every card, kept out of the
   components so the three cards and the results table cannot drift apart. */
export const labelStyle = {
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 800,
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: C.label,
};
export const inputStyle = {
  background: C.field,
  border: `2px solid ${C.line}`,
  borderRadius: 12,
  color: C.espresso,
  fontFamily: "'Nunito', sans-serif",
};
/* Table headers wear the label colour but not the uppercase letter-spacing:
   five spaced-out columns of capitals wrap into tall stacks on a phone. */
export const thStyle = {
  fontFamily: "'Nunito', sans-serif",
  fontWeight: 800,
  fontSize: 12,
  color: C.label,
};
