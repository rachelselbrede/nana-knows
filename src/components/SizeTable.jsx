import { C } from "../palette.js";
import { thStyle } from "./fieldStyles.js";
import { said, signed, tableNote } from "../lib/words.js";

/* ---------- every size at a glance ----------
   Every size side by side. Columns only appear when there is
   something honest to put in them: "comes out" needs both
   gauges, yarn needs a yardage list, the basket verdict needs
   a stocked basket. Units come from said(), so the table keeps
   the system it was asked in, like the cards above it. */
export function SizeTable({ t, results }) {
  if (!results.table) return null;
  return (
    <div className="rounded-2xl overflow-hidden nk-pop" style={{ background: C.card, border: `2px dashed ${C.line}` }}>
      <div style={{ height: 8, background: C.rose }} />
      <div className="p-4 sm:p-5">
        <h3 className="mb-3 text-base font-bold" style={{ fontFamily: "'Fraunces', serif", color: C.espresso }}>
          {t("table.title")}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse", fontVariantNumeric: "tabular-nums" }}>
            <caption className="sr-only">{t("table.caption")}</caption>
            <thead>
              <tr>
                <th scope="col" className="py-2 pr-3 text-left align-bottom" style={thStyle}>
                  {t("table.size", { lenU: said(t, results).lenU })}
                </th>
                {results.table.gaugeAdjusted && (
                  <th scope="col" className="py-2 px-3 text-right align-bottom" style={thStyle}>
                    {t("table.comesOut", { lenU: said(t, results).lenU })}
                  </th>
                )}
                <th scope="col" className="py-2 px-3 text-right align-bottom" style={thStyle}>
                  {t("table.vsAim", { target: results.table.target, lenU: said(t, results).lenU })}
                </th>
                {results.table.hasYards && (
                  <th scope="col" className="py-2 px-3 text-right align-bottom" style={thStyle}>
                    {t("table.yarn", { yarnU: said(t, results).yarnU })}
                  </th>
                )}
                {results.table.hasVerdicts && (
                  <th scope="col" className="py-2 pl-3 text-right align-bottom" style={thStyle}>
                    {t("table.basket")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {results.table.rows.map((r, i) => (
                <tr key={i} style={{ borderTop: `1.5px dashed ${C.line}`, background: r.best ? "#F3E7EC" : "transparent" }}>
                  {/* The pick is marked with words, not colour alone:
                      the tinted row means nothing to a screen reader
                      or in a greyscale print. */}
                  <th scope="row" className="py-2 pr-3 text-left align-top">
                    <span className="font-bold" style={{ color: C.espresso }}>{r.size}</span>
                    {r.best && (
                      <span className="block text-[11px] font-bold" style={{ fontFamily: "'Nunito', sans-serif", color: C.roseDark }}>
                        {t("table.pick")}
                      </span>
                    )}
                    {r.runnerUp && (
                      <span className="block text-[11px] font-bold" style={{ fontFamily: "'Nunito', sans-serif", color: C.sageDark }}>
                        {t("table.closeCall")}
                      </span>
                    )}
                  </th>
                  {results.table.gaugeAdjusted && (
                    <td className="py-2 px-3 text-right align-top" style={{ color: "#5C4B3E" }}>{r.actual}</td>
                  )}
                  <td className="py-2 px-3 text-right align-top" style={{ color: "#5C4B3E" }}>{signed(r.diff)}</td>
                  {results.table.hasYards && (
                    <td className="py-2 px-3 text-right align-top" style={{ color: "#5C4B3E" }}>
                      {r.need !== null ? r.need : "—"}
                    </td>
                  )}
                  {results.table.hasVerdicts && (
                    <td
                      className="py-2 pl-3 text-right align-top whitespace-nowrap font-bold"
                      style={{ fontFamily: "'Nunito', sans-serif", color: r.stash === "plenty" ? C.sageDark : C.roseDark }}
                    >
                      {r.stash ? t(`table.${r.stash}`, { shortAmt: r.shortAmt, yarnU: said(t, results).yarnU }) : "—"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(results.table.gaugeAdjusted || results.table.hasVerdicts) && (
          <p className="mt-3 text-xs" style={{ fontFamily: "'Nunito', sans-serif", color: "#826E5A" }}>
            {tableNote(t, results)}
          </p>
        )}
      </div>
    </div>
  );
}
