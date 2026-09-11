import { C } from "../palette.js";
import { SANS } from "../type.js";

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
      fontFamily: SANS,
      /* roseDark behind the white label, not rose: white on the lighter rose
         is 3.2:1, which is fine for the Ask button's large type and not for a
         14px pill. The unpressed pill keeps the rose text on no fill. */
      background: current === value ? C.roseDark : "transparent",
      color: current === value ? C.onAccent : C.roseText,
      border: `2px solid ${current === value ? C.roseDark : C.line}`,
    }}
  >
    {children}
  </button>
);
