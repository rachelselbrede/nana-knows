import { labelStyle, inputStyle } from "./fieldStyles.js";
import { FormCard } from "./FormCard.jsx";
import { ParseEcho } from "./ParseEcho.jsx";

/* ---------- the pattern card ----------
   What the pattern says: its gauges, its sizes, the yarn each size needs.
   `fields` and `setters` are the parent's state; the card only draws it. */
export function PatternCard({ t, fields, setters, labels, ph }) {
  const { lenU, yarnU, gaugeLabel, rowGaugeLabel } = labels;
  return (
    <FormCard title={t("card.pattern")}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span style={labelStyle}>{t("field.patternGauge", { gaugeLabel })}</span>
          <input inputMode="decimal" autoComplete="off" enterKeyHint="go" style={inputStyle} className="mt-auto px-3 py-2.5 text-sm" value={fields.patternGauge} onChange={(e) => setters.patternGauge(e.target.value)} placeholder={ph.gauge} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span style={labelStyle}>{t("field.patternRowGauge", { rowGaugeLabel })}</span>
          <input inputMode="decimal" autoComplete="off" enterKeyHint="go" style={inputStyle} className="mt-auto px-3 py-2.5 text-sm" value={fields.patternRowGauge} onChange={(e) => setters.patternRowGauge(e.target.value)} placeholder={ph.rowGauge} />
        </label>
        {/* The two list fields use htmlFor rather than wrapping, so the
            echo sits outside the label: folded inside, its whole running
            text becomes part of the input's accessible name and mutates
            on every keystroke. aria-describedby is the right channel.
            No inputMode here — the iOS decimal pad has no comma key, and
            these fields are exactly where commas get typed. */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="nk-sizes" style={labelStyle}>{t("field.finishedSizes", { lenU })}</label>
          <input id="nk-sizes" aria-describedby="nk-sizes-echo" autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="go" style={inputStyle} className="px-3 py-2.5 text-sm" value={fields.sizesText} onChange={(e) => setters.sizesText(e.target.value)} placeholder={ph.sizes} />
          <ParseEcho id="nk-sizes-echo" text={fields.sizesText} t={t} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="nk-yards" style={labelStyle}>{t("field.yarnNeeded", { yarnU })}</label>
          <input id="nk-yards" aria-describedby="nk-yards-echo" autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="go" style={inputStyle} className="px-3 py-2.5 text-sm" value={fields.yardsText} onChange={(e) => setters.yardsText(e.target.value)} placeholder={ph.yards} />
          <ParseEcho id="nk-yards-echo" text={fields.yardsText} t={t} />
        </div>
      </div>
    </FormCard>
  );
}
