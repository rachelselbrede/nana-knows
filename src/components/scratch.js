/* ---------- the helpers' shared habits ----------
   The swatch, weighing and substitution helpers each keep a little scratch
   state that is never saved or shared: it is the working-out, and the field
   it feeds is the answer. These are the habits all three share. */
import { useEffect, useRef } from "react";

/* Typing in a helper again means its confirmation no longer describes what
   is in the field above; retire it rather than let it lie. */
export const scratchEdit = (set, retire) => (e) => {
  set(e.target.value);
  retire(false);
};

/* Helper inputs sit inside the big form, so Enter would ask Nana with a
   number she has not been handed yet. Apply instead. */
export const applyOnEnter = (apply) => (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  apply();
};

/* Scratch that holds a length or a gauge follows the unit toggle like every
   other field — a width measured in inches must not read as centimetres a
   moment later. The parent converts its own fields as it switches; a helper
   converts its own the moment it sees the new units. */
export function useUnitFlip(units, convert) {
  const prev = useRef(units);
  useEffect(() => {
    if (prev.current === units) return;
    prev.current = units;
    convert(units === "cm");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units]);
}
