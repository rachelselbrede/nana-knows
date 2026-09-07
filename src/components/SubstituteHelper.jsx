import { useState } from "react";
import { C } from "../palette.js";
import { labelStyle, inputStyle } from "./fieldStyles.js";
import { Disclosure } from "./Disclosure.jsx";
import { useUnitFlip } from "./scratch.js";
import { convertOne, gaugePer4inToPer10cm, gaugePer10cmToPer4in } from "../lib/parse.js";
import { adviseSubstitute, ballsFor } from "../lib/advice.js";
import { said } from "../lib/words.js";

/* ---------- the substitution helper ----------
   Nothing to apply: it only advises, live, from the band gauge against the
   pattern's. The ball count comes from the yarn card's own cushioned need,
   so the two cannot disagree — and it can only be counted once Nana has
   been asked, because before that there is no size to count for. */
export function SubstituteHelper({ t, units, gaugeLabel, yarnU, craft, patternGauge, perSkein, results, ph }) {
  const [bandGauge, setBandGauge] = useState("");
  useUnitFlip(units, (toMetric) => {
    setBandGauge((v) => convertOne(v, toMetric ? gaugePer4inToPer10cm : gaugePer10cmToPer4in));
  });

  const verdict = adviseSubstitute({ patternGauge, bandGauge });
  const need = results && results.yarn && results.yarn.buffered ? results.yarn.buffered : null;
  const balls = ballsFor(need, perSkein);
  const ballsText = () => {
    if (verdict === null || verdict.kind === "askPattern") return "";
    if (balls !== null) {
      return t("substitute.balls", { balls, best: results.size.best, buffered: need, yarnU: said(t, results).yarnU });
    }
    if (need === null) return t("substitute.askFirst");
    return t("substitute.needPerSkein", { yarnU });
  };

  return (
    <Disclosure summary={t("substitute.summary")}>
      <div className="px-4 pb-4 text-sm" style={{ color: C.espresso }}>
        <p className="mb-3">{t("substitute.intro")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
          <label className="flex flex-col gap-1.5">
            <span style={labelStyle}>{t("substitute.bandGauge", { gaugeLabel })}</span>
            <input inputMode="decimal" autoComplete="off" enterKeyHint="done" style={inputStyle} className="mt-auto px-3 py-2 text-sm" value={bandGauge} onChange={(e) => setBandGauge(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} placeholder={ph.bandGauge} />
          </label>
        </div>
        {/* Two live lines: the verdict, then the ball count. Warn-toned
            verdicts wear the rose, like the cards. */}
        <p className="mt-2 text-sm" role="status" style={{ minHeight: "1.2em", color: verdict && verdict.tone === "warn" ? C.roseDark : C.sageDark }}>
          {verdict ? t(`substitute.${verdict.kind}`, { ...verdict, gaugeLabel, craft }) : ""}
        </p>
        <p className="mt-1 text-xs" role="status" style={{ minHeight: "1.2em", color: C.sageDark }}>
          {ballsText()}
        </p>
        <p className="mt-3 text-xs" style={{ color: C.sageDark }}>{t("substitute.tip")}</p>
      </div>
    </Disclosure>
  );
}
