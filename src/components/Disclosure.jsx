import { C } from "../palette.js";

/* The dashed oat box every helper and guide lives in, folded away until it
   is wanted. */
export function Disclosure({ summary, children }) {
  return (
    <details className="mt-4 rounded-xl" style={{ background: C.oat, border: `1.5px dashed ${C.line}` }}>
      <summary className="cursor-pointer px-4 py-3 text-sm nk-focus" style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, color: C.sageDark }}>
        {summary}
      </summary>
      {children}
    </details>
  );
}
