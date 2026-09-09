/* ---------- Nana's palette ----------
   Every colour on the page comes from here. `C` holds CSS custom properties,
   not hex values: the real numbers are written once into the stylesheet by
   GlobalStyle, so a different set can be swapped in for a different setting
   without touching a single component. `LIGHT` is the palette as painted by
   day. `ART` is the handful of colours the illustrations are drawn in; Nana's
   face and the sweater diagram are pictures, not interface, and stay the same
   whatever the page around them does.

   Roles, not hues: `ink` is body text, `label` the small uppercase field
   labels, `roseText` and `sageText` the accent colours *as text*, which is a
   different job from the accent backgrounds `roseDark` and `sageDark` and
   needs a different value to keep contrast when the page is dark. Every text
   role clears WCAG AA 4.5:1 on every background it sits on — measured, not
   guessed, and re-measure if you touch one. */

export const LIGHT = {
  oat: "#FBF6EC",
  card: "#FFFDF9",
  field: "#FFFFFF",
  line: "#E4D5C3",
  espresso: "#3E2F25",
  ink: "#5C4B3E",
  label: "#826E5A",
  muted: "#7F6F5C",
  tagline: "#6B5847",
  placeholder: "#817464",
  roseTint: "#F3E7EC",
  butterTint: "#FDF0E4",
  rose: "#D4718C",
  roseDark: "#AF546F",
  roseText: "#AF546F",
  sage: "#7E9B76",
  sageDark: "#5C7956",
  sageText: "#5C7956",
  butter: "#E9B44C",
  onAccent: "#FFFFFF",
};

/* The illustrations' own colours. Fixed on purpose: see above. */
export const ART = {
  oat: "#FBF6EC",
  card: "#FFFDF9",
  rose: "#D4718C",
  roseDark: "#AF546F",
  sage: "#7E9B76",
  sageDark: "#5C7956",
  butter: "#E9B44C",
  espresso: "#3E2F25",
  skin: "#F6D7BD",
  hair: "#CFC6C0",
  cheek: "#F2AAB2",
};

/* What the components use: `C.rose` is "var(--nk-rose)". */
export const C = Object.fromEntries(Object.keys(LIGHT).map((k) => [k, `var(--nk-${k})`]));

/* The declarations GlobalStyle writes, for one palette. */
export const declarations = (palette) =>
  Object.entries(palette)
    .map(([k, v]) => `--nk-${k}: ${v};`)
    .join(" ");
