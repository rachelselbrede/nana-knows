import { useState } from "react";
import { C } from "../palette.js";
import { labelStyle, inputStyle } from "./fieldStyles.js";
import { Disclosure } from "./Disclosure.jsx";
import { Toggle } from "./Toggle.jsx";
import { ParseEcho } from "./ParseEcho.jsx";
import { scratchEdit, applyOnEnter, useUnitFlip } from "./scratch.js";
import { ballsToYardage, convertOne, yardsToMetres, metresToYards } from "../lib/parse.js";
import { SANS } from "../type.js";

/* ---------- the balls helper ----------
   A pattern that says "7 (8, 9) balls" or "350 (400, 450) g" and never quotes
   a length. What one ball of the pattern's yarn holds turns either into the
   list the yardage field wants, so nothing downstream has to know the
   pattern counted differently. The per-size list is echoed back like the two
   list fields above it, because it is read by the same guessing parser. */
export function BallsHelper({ t, units, yarnU, ph, setYardsText }) {
  const [mode, setMode] = useState("balls");
  const [perSize, setPerSize] = useState("");
  const [ballLength, setBallLength] = useState("");
  const [ballGrams, setBallGrams] = useState("");
  const [used, setUsed] = useState(false);

  /* What a ball holds is a length and follows the toggle; balls and grams
     are the same in either system. The flip also converts the yardage field
     itself, a rounding apart from what this helper would now write, so the
     confirmation no longer describes what is up there. */
  useUnitFlip(units, (toMetric) => {
    setBallLength((v) => convertOne(v, toMetric ? yardsToMetres : metresToYards));
    setUsed(false);
  });

  const grams = mode === "grams";
  const list = ballsToYardage(perSize, ballLength, grams ? ballGrams : undefined);
  const apply = () => {
    if (!list) return;
    setYardsText(list.join(", "));
    setUsed(true);
  };
  const edit = (set) => scratchEdit(set, setUsed);
  const onKey = applyOnEnter(apply);
  /* Seven balls and seven grams are not the same request; the confirmation
     below would be describing the other one. */
  const switchMode = (next) => {
    setMode(next);
    setUsed(false);
  };

  return (
    <Disclosure summary={t("balls.summary")}>
      <div className="px-4 pb-4 text-sm" style={{ color: C.espresso }}>
        <p className="mb-3">{t("balls.intro")}</p>
        <div role="group" aria-labelledby="nk-balls-mode" className="mb-3 flex flex-wrap items-center gap-2">
          <span id="nk-balls-mode" style={labelStyle}>{t("balls.countsIn")}</span>
          <Toggle value="balls" current={mode} set={switchMode}>{t("balls.inBalls")}</Toggle>
          <Toggle value="grams" current={mode} set={switchMode}>{t("balls.inGrams")}</Toggle>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {/* htmlFor and aria-describedby, not a wrapping label, for the same
              reason as the sizes and yardage fields: the echo must not become
              part of the input's name. No inputMode either — commas. */}
          <div className="col-span-2 flex flex-col gap-1.5">
            <label htmlFor="nk-balls" style={labelStyle}>{t(grams ? "balls.perSizeGrams" : "balls.perSizeBalls")}</label>
            <input id="nk-balls" aria-describedby="nk-balls-echo" autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="done" style={inputStyle} className="px-3 py-2 text-sm" value={perSize} onChange={edit(setPerSize)} onKeyDown={onKey} placeholder={grams ? ph.gramsList : ph.ballsList} />
            <ParseEcho id="nk-balls-echo" text={perSize} t={t} />
          </div>
          <label className="flex flex-col gap-1.5">
            <span style={labelStyle}>{t("balls.ballHolds", { yarnU })}</span>
            <input inputMode="decimal" autoComplete="off" enterKeyHint="done" style={inputStyle} className="mt-auto px-3 py-2 text-sm" value={ballLength} onChange={edit(setBallLength)} onKeyDown={onKey} placeholder={ph.ballLength} />
          </label>
          {grams && (
            <label className="flex flex-col gap-1.5">
              <span style={labelStyle}>{t("balls.ballWeighs")}</span>
              <input inputMode="decimal" autoComplete="off" enterKeyHint="done" style={inputStyle} className="mt-auto px-3 py-2 text-sm" value={ballGrams} onChange={edit(setBallGrams)} onKeyDown={onKey} placeholder={ph.ballGrams} />
            </label>
          )}
          <p className="col-span-2 text-xs" role="status" style={{ color: C.sageText, minHeight: "1.2em" }}>
            {list ? t("balls.out", { list: list.join(", "), yarnU }) : ""}
          </p>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={apply}
            disabled={!list}
            className="nk-focus px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: C.sageDark, color: C.onAccent, fontFamily: SANS }}
          >
            {t("balls.use")}
          </button>
          <span role="status" className="text-xs" style={{ color: C.label }}>{used ? t("balls.used") : ""}</span>
        </div>
        <p className="mt-3 text-xs" style={{ color: C.sageText }}>{t("balls.tip")}</p>
      </div>
    </Disclosure>
  );
}
