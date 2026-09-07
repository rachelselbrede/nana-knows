import { labelStyle, inputStyle } from "./fieldStyles.js";
import { FormCard } from "./FormCard.jsx";
import { WeighHelper } from "./WeighHelper.jsx";
import { SubstituteHelper } from "./SubstituteHelper.jsx";

/* ---------- the yarn basket ----------
   What she has: the put-up of the yarn and how many of it — with the
   weighing and substitution helpers folded underneath. */
export function BasketCard({ t, fields, setters, labels, ph, craft, results }) {
  const { units, yarnU, gaugeLabel } = labels;
  return (
    <FormCard title={t("card.basket")}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span style={labelStyle}>{t("field.perSkein", { yarnU })}</span>
          <input inputMode="decimal" autoComplete="off" enterKeyHint="go" style={inputStyle} className="px-3 py-2.5 text-sm" value={fields.perSkein} onChange={(e) => setters.perSkein(e.target.value)} placeholder={ph.perSkein} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span style={labelStyle}>{t("field.skeinsYouHave")}</span>
          <input inputMode="decimal" autoComplete="off" enterKeyHint="go" style={inputStyle} className="px-3 py-2.5 text-sm" value={fields.skeins} onChange={(e) => setters.skeins(e.target.value)} placeholder={ph.skeins} />
        </label>
      </div>
      <WeighHelper t={t} yarnU={yarnU} perSkein={fields.perSkein} ph={ph} setSkeins={setters.skeins} />
      <SubstituteHelper
        t={t}
        units={units}
        gaugeLabel={gaugeLabel}
        yarnU={yarnU}
        craft={craft}
        patternGauge={fields.patternGauge}
        perSkein={fields.perSkein}
        results={results}
        ph={ph}
      />
    </FormCard>
  );
}
