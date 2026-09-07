import { C } from "../palette.js";

/* "How does Nana figure it out?" — the maths, in her voice. */
export function MathNote({ t }) {
  return (
    <details className="nk-noprint rounded-2xl p-5" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
      <summary className="nk-focus font-bold" style={{ fontFamily: "'Fraunces', serif", fontSize: 18 }}>
        {t("math.summary")}
      </summary>
      <div className="mt-3 text-sm leading-relaxed flex flex-col gap-2" style={{ fontFamily: "'Nunito', sans-serif", color: "#5C4B3E" }}>
        <p><strong>{t("math.labels.size")}</strong> {t("math.size")}</p>
        <p><strong>{t("math.labels.yarn")}</strong> {t("math.yarn")}</p>
        <p><strong>{t("math.labels.tension")}</strong> {t("math.tension")}</p>
        <p><strong>{t("math.labels.length")}</strong> {t("math.length")}</p>
      </div>
    </details>
  );
}
