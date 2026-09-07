import { C } from "../palette.js";
import { GrannySquare } from "./GrannySquare.jsx";

/* One of the three cards the knitter fills in: a granny square, a heading,
   and whatever the card asks about. */
export function FormCard({ title, children }) {
  return (
    <section className="nk-noprint rounded-2xl p-5" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
      <div className="flex items-center gap-2 mb-4">
        <GrannySquare />
        <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
