import { useState } from "react";
import { C } from "../palette.js";
import { labelStyle, inputStyle } from "./fieldStyles.js";
import { Disclosure } from "./Disclosure.jsx";
import { scratchEdit, applyOnEnter, useUnitFlip } from "./scratch.js";
import { swatchToGauge, convertOne, inchesToCm, cmToInches } from "../lib/parse.js";
import { SANS } from "../type.js";

/* ---------- the swatch helper ----------
   Live arithmetic, but nothing lands in the gauge fields until the knitter
   says so: a half-typed width would otherwise overwrite a gauge she had
   entered by hand. `used` is a flag, not a sentence, so the confirmation
   re-words itself on a language switch like everything else. */
export function SwatchHelper({ t, units, lenU, gaugeLabel, rowGaugeLabel, swatchSpan, ph, setMyGauge, setMyRowGauge }) {
  const [sts, setSts] = useState("");
  const [across, setAcross] = useState("");
  const [rows, setRows] = useState("");
  const [tall, setTall] = useState("");
  const [used, setUsed] = useState(false);
  /* The widths are lengths; the counts are just counts. */
  useUnitFlip(units, (toMetric) => {
    const len = toMetric ? inchesToCm : cmToInches;
    setAcross((v) => convertOne(v, len));
    setTall((v) => convertOne(v, len));
  });

  const stsGauge = swatchToGauge(sts, across, swatchSpan);
  const rowsGauge = swatchToGauge(rows, tall, swatchSpan);
  const ready = stsGauge !== null || rowsGauge !== null;
  const apply = () => {
    if (!ready) return;
    if (stsGauge !== null) setMyGauge(String(stsGauge));
    if (rowsGauge !== null) setMyRowGauge(String(rowsGauge));
    setUsed(true);
  };
  const edit = (set) => scratchEdit(set, setUsed);
  const onKey = applyOnEnter(apply);

  return (
    <Disclosure summary={t("swatch.summary")}>
      <div className="px-4 pb-4 text-sm" style={{ color: C.espresso }}>
        <p className="mb-3">{t("swatch.intro", { spanLabel: `${swatchSpan} ${lenU}` })}</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <label className="flex flex-col gap-1.5">
            <span style={labelStyle}>{t("swatch.stitches")}</span>
            <input inputMode="decimal" autoComplete="off" enterKeyHint="done" style={inputStyle} className="mt-auto px-3 py-2 text-sm" value={sts} onChange={edit(setSts)} onKeyDown={onKey} placeholder={ph.swatchStitches} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span style={labelStyle}>{t("swatch.across", { lenU })}</span>
            <input inputMode="decimal" autoComplete="off" enterKeyHint="done" style={inputStyle} className="mt-auto px-3 py-2 text-sm" value={across} onChange={edit(setAcross)} onKeyDown={onKey} placeholder={ph.swatchAcross} />
          </label>
          {/* Always in the DOM, so the live region exists before it has
              anything to announce. */}
          <p className="col-span-2 text-xs" role="status" style={{ color: C.sageText, minHeight: "1.2em" }}>
            {stsGauge !== null ? t("swatch.stitchesOut", { gauge: stsGauge, gaugeLabel }) : ""}
          </p>
          <label className="flex flex-col gap-1.5">
            <span style={labelStyle}>{t("swatch.rows")}</span>
            <input inputMode="decimal" autoComplete="off" enterKeyHint="done" style={inputStyle} className="mt-auto px-3 py-2 text-sm" value={rows} onChange={edit(setRows)} onKeyDown={onKey} placeholder={ph.swatchRows} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span style={labelStyle}>{t("swatch.tall", { lenU })}</span>
            <input inputMode="decimal" autoComplete="off" enterKeyHint="done" style={inputStyle} className="mt-auto px-3 py-2 text-sm" value={tall} onChange={edit(setTall)} onKeyDown={onKey} placeholder={ph.swatchTall} />
          </label>
          <p className="col-span-2 text-xs" role="status" style={{ color: C.sageText, minHeight: "1.2em" }}>
            {rowsGauge !== null ? t("swatch.rowsOut", { gauge: rowsGauge, rowGaugeLabel }) : ""}
          </p>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={apply}
            disabled={!ready}
            className="nk-focus px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: C.sageDark, color: C.onAccent, fontFamily: SANS }}
          >
            {t("swatch.use")}
          </button>
          <span role="status" className="text-xs" style={{ color: C.label }}>{used ? t("swatch.used") : ""}</span>
        </div>
        <p className="mt-3 text-xs" style={{ color: C.sageText }}>{t("swatch.tip")}</p>
      </div>
    </Disclosure>
  );
}
