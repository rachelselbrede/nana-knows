import { C } from "../palette.js";
import { SANS } from "../type.js";
import { Toggle } from "./Toggle.jsx";

/* ---------- the notebook's pages ----------
   One pill per saved project, the open one pressed. Nothing at all until the
   knitter has saved something: a row of buttons over an empty notebook would
   answer a question she has not asked. Opening a page rewrites every field,
   which is the parent's business; this row only says which pages there are
   and which one the form came from. */
export function ProjectPicker({ t, pages, openName, openProject }) {
  if (!pages || pages.length === 0) return null;
  return (
    <div
      role="group"
      aria-labelledby="nk-notebook-label"
      className="nk-noprint flex flex-wrap items-center gap-2 text-sm"
      style={{ fontFamily: SANS }}
    >
      <span id="nk-notebook-label" style={{ color: C.label, fontWeight: 700 }}>
        {t("notebook.label")}
      </span>
      {pages.map((p) => (
        <Toggle key={p.name} value={p.name} current={openName} set={openProject}>
          {p.name || t("notebook.unnamed")}
        </Toggle>
      ))}
    </div>
  );
}
