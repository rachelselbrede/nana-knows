import { C } from "../palette.js";
import { SANS } from "../type.js";
import { inputStyle, labelStyle } from "./fieldStyles.js";
import { MAX_NAME } from "../lib/notebook.js";

/* ---------- remember me, forget me, share ----------
   A name for the page, the links, and the status line their confirmations
   land in. The name and the remember button are a small form of their own,
   so Enter in the name field saves; it has to be its own form, because the
   Ask form ends just above this row. */
export function RememberRow({
  t,
  pageName,
  setPageName,
  ph,
  rememberMe,
  forgetMe,
  forgetThis,
  canForgetThis,
  shareLink,
  saveMsg,
}) {
  /* The status span holds a key — or a key and its parameters — never a
     sentence, so the little confirmations follow a language switch like the
     advice cards do. A page with no name is named here, at render time, for
     the same reason. */
  const status = !saveMsg
    ? ""
    : typeof saveMsg === "string"
      ? t(saveMsg)
      : t(saveMsg.key, { ...saveMsg.params, name: saveMsg.params.name || t("notebook.unnamed") });
  const link = "nk-focus font-bold underline decoration-2 underline-offset-2";
  return (
    <>
      <div
        className="nk-noprint flex flex-wrap items-center gap-3 text-sm"
        style={{ fontFamily: SANS }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            rememberMe();
          }}
          className="flex flex-wrap items-center gap-3"
        >
          <label className="flex items-center gap-2">
            <span style={labelStyle}>{t("remember.name")}</span>
            <input
              type="text"
              autoComplete="off"
              maxLength={MAX_NAME}
              style={inputStyle}
              className="px-3 py-1.5 text-sm"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              placeholder={ph.projectName}
            />
          </label>
          <button type="submit" className={link} style={{ color: C.sageText }}>
            {t("remember.save")}
          </button>
        </form>
        {canForgetThis && (
          <button type="button" onClick={forgetThis} className={link} style={{ color: C.muted }}>
            {t("remember.forgetOne")}
          </button>
        )}
        <button type="button" onClick={forgetMe} className={link} style={{ color: C.muted }}>
          {t("remember.forget")}
        </button>
        <button type="button" onClick={shareLink} className={link} style={{ color: C.roseText }}>
          {t("share.button")}
        </button>
        {/* Always in the tree so the live region exists before the first
            message lands — a region that appears with its text is skipped by
            some screen readers. The id is for the smoke run, which reads this
            one status apart from the parse echoes. */}
        <span id="nk-save-status" role="status" style={{ color: C.label }}>
          {status}
        </span>
      </div>
      <p className="nk-noprint text-xs -mt-2" style={{ fontFamily: SANS, color: C.muted }}>
        {t("share.note")}
      </p>
    </>
  );
}
