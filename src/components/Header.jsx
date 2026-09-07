import { C } from "../palette.js";
import { Nana } from "./Nana.jsx";

/* ---------- the top of the page ----------
   The language switch, Nana herself, the title and the tagline, and the
   scalloped rose edge beneath. */
export function Header({ t, lang, setLang }) {
  return (
    <>
      {/* header */}
      <header className="max-w-2xl mx-auto px-5 pt-8 pb-2">
        {/* language switch */}
        <div className="nk-noprint flex justify-end mb-2">
          <div
            role="group"
            aria-label={t("lang.toggleLabel")}
            className="inline-flex rounded-full overflow-hidden"
            style={{ border: `2px solid ${C.line}` }}
          >
            <button
              type="button"
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
              aria-label={t("lang.switchToEn")}
              lang="en"
              className="nk-focus px-3 py-1 text-xs font-bold transition-colors"
              style={{
                fontFamily: "'Nunito', sans-serif",
                background: lang === "en" ? C.sageDark : "transparent",
                color: lang === "en" ? "#FFF" : C.sageDark,
              }}
            >
              {t("lang.en")}
            </button>
            {/* lang="es": the label stays Spanish whichever language the page is
                in, so say so, or a screen reader reads it with an English
                accent. The English button is marked the same way. */}
            <button
              type="button"
              onClick={() => setLang("es")}
              aria-pressed={lang === "es"}
              aria-label={t("lang.switchToEs")}
              lang="es"
              className="nk-focus px-3 py-1 text-xs font-bold transition-colors"
              style={{
                fontFamily: "'Nunito', sans-serif",
                background: lang === "es" ? C.sageDark : "transparent",
                color: lang === "es" ? "#FFF" : C.sageDark,
              }}
            >
              {t("lang.es")}
            </button>
          </div>
        </div>
        <div className="flex items-end gap-4 sm:gap-6">
          <div className="shrink-0">
            <Nana size={140} label={t("nana.alt")} />
          </div>
          <div className="pb-2">
            <h1
              className="leading-none"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 900, fontSize: "clamp(34px, 8vw, 52px)" }}
            >
              Nana Knows
            </h1>
            <p className="mt-2 text-sm sm:text-base" style={{ fontFamily: "'Nunito', sans-serif", color: "#6B5847" }}>
              {t("header.tagline")}
            </p>
            <p className="mt-2 text-xs font-bold" style={{ fontFamily: "'Nunito', sans-serif", color: C.sageDark }}>
              {t("header.badge")}
            </p>
          </div>
        </div>
      </header>
      <div className="nk-edge" aria-hidden="true" />
    </>
  );
}
