import { useState } from "react";
import { C } from "../palette.js";
import { labelStyle, inputStyle } from "./fieldStyles.js";
import { Disclosure } from "./Disclosure.jsx";
import { scratchEdit, applyOnEnter } from "./scratch.js";
import { gramsToSkeins, parseOne, r1 } from "../lib/parse.js";

/* ---------- the weighing helper ----------
   Grams over grams-per-skein is skeins, which drops into the field the yarn
   card already reads, so nothing downstream has to know about grams. The
   yardage shown alongside is worked from the rounded skeins figure, so it is
   exactly what the card will go on to use. Grams are grams in either unit
   system, so there is nothing here for the toggle to convert. */
export function WeighHelper({ t, yarnU, perSkein, ph, setSkeins }) {
  const [skeinWeight, setSkeinWeight] = useState("");
  const [have, setHave] = useState("");
  const [used, setUsed] = useState(false);

  const skeins = gramsToSkeins(have, skeinWeight);
  const per = parseOne(perSkein);
  const yards = skeins !== null && per !== null ? r1(skeins * per) : null;
  const apply = () => {
    if (skeins === null) return;
    setSkeins(String(skeins));
    setUsed(true);
  };
  const edit = (set) => scratchEdit(set, setUsed);
  const onKey = applyOnEnter(apply);

  return (
    <Disclosure summary={t("weigh.summary")}>
      <div className="px-4 pb-4 text-sm" style={{ color: C.espresso }}>
        <p className="mb-3">{t("weigh.intro")}</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <label className="flex flex-col gap-1.5">
            <span style={labelStyle}>{t("weigh.skeinWeighs")}</span>
            <input inputMode="decimal" autoComplete="off" enterKeyHint="done" style={inputStyle} className="mt-auto px-3 py-2 text-sm" value={skeinWeight} onChange={edit(setSkeinWeight)} onKeyDown={onKey} placeholder={ph.weighSkein} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span style={labelStyle}>{t("weigh.haveWeighs")}</span>
            <input inputMode="decimal" autoComplete="off" enterKeyHint="done" style={inputStyle} className="mt-auto px-3 py-2 text-sm" value={have} onChange={edit(setHave)} onKeyDown={onKey} placeholder={ph.weighHave} />
          </label>
          <p className="col-span-2 text-xs" role="status" style={{ color: C.sageDark, minHeight: "1.2em" }}>
            {skeins !== null ? t("weigh.out", { skeins, yards, yarnU }) : ""}
          </p>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={apply}
            disabled={skeins === null}
            className="nk-focus px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: C.sageDark, color: "#FFFFFF", fontFamily: "'Nunito', sans-serif" }}
          >
            {t("weigh.use")}
          </button>
          <span role="status" className="text-xs" style={{ color: "#826E5A" }}>{used ? t("weigh.used") : ""}</span>
        </div>
        <p className="mt-3 text-xs" style={{ color: C.sageDark }}>{t("weigh.tip")}</p>
      </div>
    </Disclosure>
  );
}
