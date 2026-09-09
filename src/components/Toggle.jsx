import { C } from "../palette.js";

/* ---------- shared small pieces ----------
   These live at module scope on purpose. Defined inside the component they
   would be a brand-new component type every render, so React would tear down
   and rebuild their DOM instead of updating it — which threw keyboard focus
   off the craft and unit toggles the moment they were pressed. */

/* aria-pressed matters here: the only other clue that you are in crochet
   rather than knitting mode is the pink fill, which a screen reader cannot
   see and a colour-blind visitor may not distinguish. */
export const Toggle = ({ value, current, set, children }) => (
  <button
    type="button"
    onClick={() => set(value)}
    aria-pressed={current === value}
    className="nk-focus px-3 py-1.5 text-sm font-bold rounded-full transition-colors"
    style={{
      fontFamily: "'Nunito', sans-serif",
      background: current === value ? C.rose : "transparent",
      color: current === value ? C.onAccent : C.roseText,
      border: `2px solid ${current === value ? C.rose : C.line}`,
    }}
  >
    {children}
  </button>
);
