/* ---------- turning Nana's findings into Nana's words ----------
   `results` holds numbers and decision kinds; these turn them into sentences
   through whatever dictionary `t` is speaking at the moment. They run during
   render, which is what lets a language or craft switch re-word advice that
   has already been given, and they take `t` and `results` as arguments
   rather than closing over component state, which is what lets them be
   tested against both dictionaries without React. */

/* Language and craft are pure wording, so advice already on screen should
   follow a switch. Units are not: the numbers in `results` were worked out in
   whichever system was showing when Nana was asked, and 40 in is not 40 cm.
   So the cards keep the units they were measured in, even after the toggle
   converts the fields above them. */
export const said = (t, results) => {
  const wasInch = results.inch;
  return {
    lenU: wasInch ? "in" : "cm",
    yarnU: wasInch ? "yds" : "m",
    gaugeLabel: t("label.gaugeLabel", { inch: wasInch }),
    rowGaugeLabel: t("label.rowGaugeLabel", { inch: wasInch }),
  };
};

export const sizeText = (t, results) => {
  const s = results.size;
  const u = said(t, results);
  const easeLabel = t("ease.labels", { inch: results.inch })[results.easeIdx].toLowerCase();
  const base = s.gaugeAdjusted && s.actual !== s.best
    ? t("result.size.mainAdjusted", {
        best: s.best,
        actual: s.actual,
        lenU: u.lenU,
        b: results.bust,
        easeLabel,
        target: s.target,
      })
    : t("result.size.main", {
        best: s.best,
        lenU: u.lenU,
        b: results.bust,
        easeLabel,
        target: s.target,
      });
  return s.runnerUp !== null
    ? base + t("result.size.runnerUp", { runnerUp: s.runnerUp })
    : base;
};

export const yarnText = (t, results) => {
  const y = results.yarn;
  const yarnU = said(t, results).yarnU;
  const body = t(`result.yarn.${y.kind}`, { ...y, best: results.size.best, yarnU });
  /* Postscripts in a fixed order: the gauge working first, because it
     explains the figure just quoted, then the list-length nag. */
  return (
    body +
    (y.gaugeAdjusted ? t("result.yarn.adjusted", { ...y, yarnU }) : "") +
    (y.mismatch ? t("result.yarn.mismatch") : "")
  );
};

export const gaugeText = (t, results, craft) => {
  const u = said(t, results);
  return t(`result.gauge.${results.gauge.kind}`, {
    ...results.gauge,
    gaugeLabel: u.gaugeLabel,
    lenU: u.lenU,
    craft,
  });
};

export const rowText = (t, results) => {
  const u = said(t, results);
  return t(`result.row.${results.row.kind}`, {
    ...results.row,
    rowGaugeLabel: u.rowGaugeLabel,
    lenU: u.lenU,
  });
};

/* The aim column reads best signed: "+1.2" is roomier than asked for,
   "-0.8" snugger. String(-0) is "0" in JavaScript, so a hair under the aim
   that rounds away never prints as a puzzling "-0". */
export const signed = (n) => (n > 0 ? `+${n}` : String(n));

export const tableNote = (t, results) =>
  t("table.note", {
    gaugeAdjusted: results.table.gaugeAdjusted,
    hasVerdicts: results.table.hasVerdicts,
    yarnAdjusted: results.table.yarnAdjusted,
  });

/* One table row as a line of plain text, for the Ravelry copy below. */
export const tableLine = (t, results, r) => {
  const u = said(t, results);
  const head =
    `${r.size} ${u.lenU}` +
    (results.table.gaugeAdjusted ? ` → ${r.actual} ${u.lenU}` : "");
  const rest = [
    r.need !== null ? `${r.need} ${u.yarnU}` : "",
    r.stash ? t(`table.${r.stash}`, { shortAmt: r.shortAmt, yarnU: u.yarnU }) : "",
  ].filter(Boolean);
  const badge = r.best
    ? ` — ${t("table.pick")}`
    : r.runnerUp
      ? ` — ${t("table.closeCall")}`
      : "";
  return [head, ...rest].join(" · ") + badge;
};

/* Turn the four advice cards into plain text Nana's visitor can paste into a
   Ravelry project note. Built from the same messages shown on screen. */
export const adviceAsText = (t, results, craft, proverb) =>
  [
    t("copy.heading"),
    "",
    /* The dictionary owns the quotation marks: Spanish advice gets its
       guillemets in the pasted text, same as on screen. */
    proverb ? t("copy.proverb", { proverb }) : "",
    "",
    t("advice.size"),
    sizeText(t, results),
    "",
    t("advice.yarn"),
    yarnText(t, results),
    "",
    t("advice.tension"),
    gaugeText(t, results, craft),
    "",
    t("advice.length"),
    rowText(t, results),
    /* The table travels too, one size per line, so the whole decision goes
       into the project notes and not just the winner. */
    ...(results.table
      ? ["", t("table.title"), ...results.table.rows.map((r) => tableLine(t, results, r))]
      : []),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
