import { C } from "../palette.js";
import { parseNumberList } from "../lib/parse.js";

/* Show the knitter what Nana made of her typing. Commas and dashes are
   genuinely ambiguous — "32,36" could be two sizes or one odd decimal — and
   no heuristic gets every case. Echoing the reading back turns a wrong guess
   into something visible and correctable, which is worth more than a cleverer
   guess would be. The span stays in the tree even when quiet, so the status
   region exists before it has anything to announce, and the input points at it
   with aria-describedby instead of swallowing it into its own label. */
export const ParseEcho = ({ id, text, t }) => {
  const { values, issues } = parseNumberList(text);
  const quiet = values.length === 0 || (values.length === 1 && issues.length === 0);
  return (
    <span id={id} role="status" className="text-xs" style={{ color: C.sageText }}>
      {quiet
        ? ""
        : t("echo.read", { list: values.join(", ") }) +
          issues.map((i) => t(`echo.${i}`)).join("")}
    </span>
  );
};
