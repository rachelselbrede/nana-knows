import { C } from "../palette.js";
import { Toggle } from "./Toggle.jsx";

/* ---------- craft and units ----------
   Two pairs of pills. Switching units converts every field, which is the
   parent's business; the row only says which is pressed. */
export function Toggles({ t, craft, setCraft, units, switchUnits }) {
  return (
    <div className="nk-noprint flex flex-wrap items-center gap-2">
      <div role="group" aria-label={t("toggle.craftLabel")} className="flex gap-2">
        <Toggle value="knit" current={craft} set={setCraft}>{t("toggle.knitting")}</Toggle>
        <Toggle value="crochet" current={craft} set={setCraft}>{t("toggle.crochet")}</Toggle>
      </div>
      <span className="mx-1" aria-hidden="true" style={{ color: C.line }}>|</span>
      <div role="group" aria-label={t("toggle.unitsLabel")} className="flex gap-2">
        <Toggle value="in" current={units} set={switchUnits}>{t("toggle.inYds")}</Toggle>
        <Toggle value="cm" current={units} set={switchUnits}>{t("toggle.cmM")}</Toggle>
      </div>
    </div>
  );
}
