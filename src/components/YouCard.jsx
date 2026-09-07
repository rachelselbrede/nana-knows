import { labelStyle, inputStyle } from "./fieldStyles.js";
import { FormCard } from "./FormCard.jsx";
import { SwatchHelper } from "./SwatchHelper.jsx";
import { MeasureGuide } from "./MeasureGuide.jsx";

/* ---------- the You card ----------
   The knitter herself: her measurement, how she likes things to fit, and
   the gauge her own hands make — with the swatch helper and the measuring
   guide folded underneath. */
export function YouCard({ t, fields, setters, labels, ph, easeOptions }) {
  const { units, lenU, gaugeLabel, rowGaugeLabel, swatchSpan } = labels;
  return (
    <FormCard title={t("card.you")}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span style={labelStyle}>{t("field.bust", { lenU })}</span>
          <input inputMode="decimal" autoComplete="off" enterKeyHint="go" style={inputStyle} className="mt-auto px-3 py-2.5 text-sm" value={fields.bust} onChange={(e) => setters.bust(e.target.value)} placeholder={ph.bust} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span style={labelStyle}>{t("field.fit")}</span>
          <select style={inputStyle} className="mt-auto px-3 py-2.5 text-sm nk-focus" value={fields.easeIdx} onChange={(e) => setters.easeIdx(Number(e.target.value))}>
            {easeOptions.map((o, i) => (
              <option key={i} value={i}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span style={labelStyle}>{t("field.swatchGauge", { gaugeLabel })}</span>
          <input inputMode="decimal" autoComplete="off" enterKeyHint="go" style={inputStyle} className="mt-auto px-3 py-2.5 text-sm" value={fields.myGauge} onChange={(e) => setters.myGauge(e.target.value)} placeholder={ph.myGauge} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span style={labelStyle}>{t("field.swatchRowGauge", { rowGaugeLabel })}</span>
          <input inputMode="decimal" autoComplete="off" enterKeyHint="go" style={inputStyle} className="mt-auto px-3 py-2.5 text-sm" value={fields.myRowGauge} onChange={(e) => setters.myRowGauge(e.target.value)} placeholder={ph.myRowGauge} />
        </label>
      </div>
      <SwatchHelper
        t={t}
        units={units}
        lenU={lenU}
        gaugeLabel={gaugeLabel}
        rowGaugeLabel={rowGaugeLabel}
        swatchSpan={swatchSpan}
        ph={ph}
        setMyGauge={setters.myGauge}
        setMyRowGauge={setters.myRowGauge}
      />
      <MeasureGuide t={t} />
    </FormCard>
  );
}
