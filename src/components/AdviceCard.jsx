import { C } from "../palette.js";

/* ---------- advice card ---------- */
export function AdviceCard({ color, title, children, tone }) {
  return (
    <div
      className="rounded-2xl overflow-hidden nk-pop"
      style={{ background: C.card, border: `2px dashed ${C.line}` }}
    >
      <div style={{ height: 8, background: color }} />
      <div className="p-4 sm:p-5">
        <h3
          className="mb-2 text-base font-bold"
          style={{ fontFamily: "'Fraunces', serif", color: C.espresso }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: tone === "warn" ? C.roseText : C.ink }}
        >
          {children}
        </p>
      </div>
    </div>
  );
}
