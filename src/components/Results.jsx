import { C } from "../palette.js";
import { Nana } from "./Nana.jsx";
import { AdviceCard } from "./AdviceCard.jsx";
import { SizeTable } from "./SizeTable.jsx";
import { sizeText, yarnText, gaugeText, rowText } from "../lib/words.js";

/* ---------- Nana's answer ----------
   The status line, the four cards, the table and the copy-and-print row.
   `results` holds numbers and kinds; every sentence here is built at render
   through `t`, so a language or craft switch re-words the answer in place.
   The two refs belong to the parent, which moves focus here after asking. */
export function Results({ t, results, craft, proverb, askCount, resultsRef, headingRef, copyAdvice, printAdvice, copyMsg }) {
  return (
    <>
      {/* results. The live region is a single sentence, kept in the DOM from
          the start so it exists before it has anything to say; the cards
          themselves are not live, and are read from the focused heading at
          the reader's own pace instead of in one breath. The inner span is
          keyed by ask, so an identical answer is still re-announced. */}
      <p role="status" className="sr-only">
        {results && (
          <span key={askCount}>
            {results.error ? t("result.error") : t("status.answer", { best: results.size.best })}
          </span>
        )}
      </p>
      <div ref={resultsRef} tabIndex={-1} className="nk-results">
        {results && results.error && (
          <div className="rounded-2xl p-5 nk-pop flex gap-4 items-start" style={{ background: "#FDF0E4", border: `2px dashed ${C.butter}` }}>
            <div className="shrink-0"><Nana size={64} bob={false} label={t("nana.alt")} /></div>
            <p ref={headingRef} tabIndex={-1} className="nk-results-head text-sm leading-relaxed" style={{ fontFamily: "'Nunito', sans-serif" }}>{t("result.error")}</p>
          </div>
        )}
        {results && !results.error && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 nk-pop">
              <div className="shrink-0 mt-1"><Nana size={72} bob={false} label={t("nana.alt")} /></div>
              <div className="relative rounded-2xl px-4 py-3" style={{ background: "#F3E7EC", border: `2px solid ${C.rose}` }}>
                {/* A heading, so the answer has a landmark for a screen reader
                    to land on; styled as the speech-bubble line it always was. */}
                <h2 ref={headingRef} tabIndex={-1} className="nk-results-head text-sm italic" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 400, color: C.roseDark }}>
                  {t("result.intro", { proverb })}
                </h2>
              </div>
            </div>
            <AdviceCard color={C.rose} title={t("advice.size")}>{sizeText(t, results)}</AdviceCard>
            <AdviceCard color={C.butter} title={t("advice.yarn")} tone={results.yarn.tone === "warn" ? "warn" : "ok"}>{yarnText(t, results)}</AdviceCard>
            <AdviceCard color={C.sage} title={t("advice.tension")} tone={results.gauge.tone === "warn" ? "warn" : "ok"}>{gaugeText(t, results, craft)}</AdviceCard>
            <AdviceCard color={C.sageDark} title={t("advice.length")} tone={results.row.tone === "warn" ? "warn" : "ok"}>{rowText(t, results)}</AdviceCard>

            <SizeTable t={t} results={results} />

            <div className="nk-noprint flex flex-wrap items-center gap-3 text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
              <button type="button" onClick={copyAdvice} className="nk-focus font-bold underline decoration-2 underline-offset-2" style={{ color: C.sageDark }}>
                {t("copy.button")}
              </button>
              <button type="button" onClick={printAdvice} className="nk-focus font-bold underline decoration-2 underline-offset-2" style={{ color: C.roseDark }}>
                {t("copy.print")}
              </button>
              <span role="status" style={{ color: "#826E5A" }}>{copyMsg ? t(copyMsg) : ""}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
