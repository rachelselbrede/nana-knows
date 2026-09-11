/* ---------- the type ----------
   Two families, self-hosted from public/fonts so no visitor's browser ever
   asks a third party for them and an installed Nana still has them offline.
   Alegreya is a calligraphic book serif with matching sans — the page reads
   like a printed pattern leaflet, not a dashboard. Both are Open Font
   Licence; the licences sit beside the files. The @font-face rules are in
   src/index.css; everything in the components says SERIF or SANS and never
   names a family, so changing the type is a change to two files. */
export const SERIF = "'Alegreya', Georgia, serif";
export const SANS = "'Alegreya Sans', 'Gill Sans', sans-serif";
