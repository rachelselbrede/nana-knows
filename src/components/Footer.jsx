import { C } from "../palette.js";
import { GrannySquare } from "./GrannySquare.jsx";
import { SANS } from "../type.js";

/* ---------- the foot of the page ----------
   Five granny squares, the privacy line, and the invitation to tell Nana
   what to learn next. */
export function Footer({ t }) {
  return (
    <footer className="nk-noprint max-w-2xl mx-auto px-5 pb-10 pt-2 text-center" style={{ fontFamily: SANS }}>
      <div className="flex justify-center gap-2 mb-3" aria-hidden="true">
        <GrannySquare size={14} /><GrannySquare size={14} /><GrannySquare size={14} /><GrannySquare size={14} /><GrannySquare size={14} />
      </div>
      <p className="text-xs" style={{ color: C.label }}>
        {t("footer.privacy")}
      </p>
      <p className="text-xs mt-3">
        <a
          href="https://github.com/rachelselbrede/nana-knows/issues"
          target="_blank"
          rel="noreferrer noopener"
          className="nk-focus nk-link font-bold rounded"
          style={{ color: C.roseText }}
        >
          {t("footer.learnNext")}
          <span className="sr-only"> {t("footer.newTab")}</span>
        </a>
      </p>
    </footer>
  );
}
