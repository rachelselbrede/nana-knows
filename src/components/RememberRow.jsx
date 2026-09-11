import { C } from "../palette.js";
import { SANS } from "../type.js";

/* ---------- remember me, forget me, share ----------
   Three links and the status line their confirmations land in. */
export function RememberRow({ t, rememberMe, forgetMe, shareLink, saveMsg }) {
  return (
    <>
      {/* remember me */}
      <div className="nk-noprint flex flex-wrap items-center gap-3 text-sm" style={{ fontFamily: SANS }}>
        <button type="button" onClick={rememberMe} className="nk-focus font-bold underline decoration-2 underline-offset-2" style={{ color: C.sageText }}>
          {t("remember.save")}
        </button>
        <button type="button" onClick={forgetMe} className="nk-focus font-bold underline decoration-2 underline-offset-2" style={{ color: C.muted }}>
          {t("remember.forget")}
        </button>
        <button type="button" onClick={shareLink} className="nk-focus font-bold underline decoration-2 underline-offset-2" style={{ color: C.roseText }}>
          {t("share.button")}
        </button>
        {/* Always in the tree so the live region exists before the first
            message lands — a region that appears with its text is skipped by
            some screen readers. The span holds a key, not a sentence, so the
            little confirmations follow a language switch like the advice
            cards do. */}
        <span role="status" style={{ color: C.label }}>{saveMsg ? t(saveMsg) : ""}</span>
      </div>
      <p className="nk-noprint text-xs -mt-2" style={{ fontFamily: SANS, color: C.muted }}>
        {t("share.note")}
      </p>
    </>
  );
}
