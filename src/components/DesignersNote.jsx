import { C } from "../palette.js";

/* "Are you a designer?" — how to put Nana in a pattern, kept at the foot of
   the page, out of the knitter's way. */
export function DesignersNote({ t }) {
  return (
    <details className="nk-noprint rounded-2xl p-5" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
      <summary className="nk-focus font-bold" style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>
        {t("designers.summary")}
      </summary>
      <div className="mt-3 text-sm leading-relaxed" style={{ fontFamily: "'Nunito', sans-serif", color: C.ink }}>
        <p>{t("designers.intro")}</p>
        <ol className="list-decimal pl-5 mt-2 flex flex-col gap-1.5">
          {t("designers.steps").map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        <p className="mt-3" style={{ color: C.sageText }}>{t("designers.note")}</p>
      </div>
    </details>
  );
}
