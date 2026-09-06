# Nana Knows — working notes for Claude

Free, client-side sizing / yardage / gauge advice for knitters and crocheters,
delivered by **Nana Purl**. No backend, no accounts, no analytics, no cookies.
Live at <https://rachelselbrede.github.io/nana-knows/>.

Read `HANDOFF.md` next for project history, current state and the roadmap.

## Commands

```bash
npm run dev      # Vite dev server (PWA enabled in dev, so what you test matches what ships)
npm run build    # production build into dist/
npm test         # node --test "src/**/*.test.js"  — 246 tests, ~75ms, zero dependencies
```

The quoted glob in `test` matters. Bare `node --test src/` fails: this Node treats
the directory argument as a module path.

## Architecture

```
src/
  NanaKnows.jsx     ~1510 lines: palette, three SVG illustrations, all state,
                    share/save/print plumbing, entire layout
  lib/parse.js      raw text -> numbers, unit conversion. Pure, no React, no language.
                    parseOne is the only correct way to read a single-value field.
  lib/advice.js     the arithmetic. Numbers in, {kind, tone, ...numbers} out.
  i18n/index.jsx    I18nProvider / useI18n / t(). ~90 lines.
  i18n/en.js        152 keys
  i18n/es.js        152 keys, same shape
  *.test.js         parse 77, advice 78, wording 91
```

### The load-bearing idea

`results` holds **numbers and decision kinds, never finished sentences.** The
wording happens during render, in `sizeText()` / `yarnText()` / `gaugeText()` /
`rowText()`. That is what lets a language or craft switch re-word advice that is
already on screen, and it is also what makes the arithmetic testable. Do not
move sentence-building back into `askNana()`.

`advice.js` functions return a `kind` (e.g. `allSet`, `justCovers`, `short`) and
the component looks up `result.<card>.<kind>` in the dictionary. Adding a branch
therefore means adding a key to **both** `en.js` and `es.js` — `wording.test.js`
will fail loudly if you forget.

`tone` is `ok` | `ask` | `warn` and belongs to the decision, not the phrasing.

## Invariants — break these and something subtle goes wrong

**Language and craft follow a switch. Units do not.** The numbers in `results`
were worked out in whichever unit system was showing when Nana was asked, and
40 in is not 40 cm. Unit labels come from `results.inch` via `said()`, and the
ease label from `results.easeIdx`, never from live state. This bug has been
introduced once already; it is invisible without actually rendering the cards.

**Gauge converts on the unit flip, via 10.16, not 10.** Four inches is 10.16 cm.
The 1.6% cancels in the `ug/pg` ratio but not in the row-length maths, where
`swatchSpan` is an absolute.

**The parser guesses, and says so.** Commas mean three different things
(`32,36` a list, `91,5` a European decimal, `1,100` a thousands mark). No
heuristic wins every case, so `parseNumberList` returns `{values, issues}` and
`ParseEcho` shows the reading back to the knitter. Making a wrong guess
*visible* beats a cleverer silent guess. Never let a size be dropped silently.

**Order is preserved** in parsed lists — yardage lines up with sizes by position.

**First-load precedence:** a shared link wins whatever it carries. The saved
notebook (personal fields only) is opened as well *unless* the link carries
personal params of its own (`PERSONAL_KEYS`: b, mg, mrg, ps, sk, e) — mixing
your numbers with someone else's would be wrong, but a designer's pattern-only
link plus your notebook is the whole point. Notebook numbers are converted into
the link's units on the way in. For language: `?lang` beats saved `nana-lang`
beats `navigator.language`.

**Unit abbreviations** (`in`, `cm`, `yds`, `m`) live in the component and are not
translated. Dictionary numbers keep period decimals so they survive `parseList`.

## Constants

```
YARN_CUSHION          1.1     10% — running out at the second sleeve is heartbreak
GAUGE_TOLERANCE       0.25    a quarter stitch is inside the noise of counting
STITCHES_PER_TOOL_SIZE 2      one needle/hook size ~= 2 sts per 4 in
SUBSTITUTE_CLOSE      1       a band gauge within a stitch is the same weight class
SUBSTITUTE_STRETCH    3       within three, a needle change can coax it; beyond, a different yarn
closeGap              1 in / 2.5 cm     how near a runner-up size has to be
swatchSpan            4 in / 10 cm
in<->cm 2.54 | yds<->m 0.9144 | gauge per-4in <-> per-10cm 10.16
```

Size maths: `target = measurement + ease`; a pattern size `s` is a stitch count
of `s*pg/4`, so worked at your gauge it comes out `s*pg/ug` wide. Best size
minimises `|realWidth(s) - target|`. The runner-up ranks **by fit**, not by
nearness in inches — those differ on unevenly spaced size ranges.

Yardage at your gauge is the pattern's figure × `pg/ug` (first order: yarn per
stitch follows stitch size, which is one over gauge), rounded to whole yards.
`yarnAtGauge()` does it for the yarn card and for every table row — one
function, so the two cannot disagree — and the wording only mentions the
scaling when it actually moved the number.

## Voice

Nana is a warm grandmother, not a machine. She says "dear" and "mija", never
"Error:". Spanish is neutral Latin American — a warm abuela — with diminutives
("anda cerquita", "un poquito"). "Nana Purl" is never translated. Knitting is
"tejer (dos agujas)", crochet is "crochet / ganchillo".

Comments in this repo explain **why**, not what. Commit messages are prose
paragraphs a person would write, describing the problem before the fix. Match
that register; it is most of what makes the repo pleasant to read.

## Gotchas

- `base: "/nana-knows/"` in `vite.config.js` must match the repo name. Change to
  `/` if a custom domain ever lands.
- Pushing to `main` deploys. The workflow now runs `npm test` first, so a failing
  suite blocks the site update.
- Tailwind v4 is installed but barely used for colour — every colour is an inline
  `style={{}}` off the `C` palette object.
- Palette colours were darkened to the *minimum* that clears WCAG AA 4.5:1.
  If you touch a text colour, re-check the ratio.
