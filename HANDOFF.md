# Nana Knows — handoff

Written 19 August 2026 at commit `ca1cd65`; head section refreshed 20 August
2026 on the `nana-upgrades` branch, and again 1 September 2026 after that
branch merged. Read `CLAUDE.md` first for how the code works; this file is
about where the project stands and where it could go.

---

## Read this bit first

Everything is on `main` and live. The `nana-upgrades` batch described below
merged and deployed on 31 August 2026, and five things have shipped since:

- **The all-sizes comparison table** (`1c24f84`) — item 2 of the feature list
  further down. `sizeTable()` in `advice.js` lays out every pattern size with
  its gauge-adjusted real measurement, distance from the aim, yardage and a
  basket verdict; the verdicts run `adviseYarn`'s exact cushion arithmetic so
  the table can never disagree with the yarn card above it. Columns appear
  only when they have something to say. Fifteen tests, both dictionaries.
- **The measuring sweater redrawn** (`ed55778` and two follow-ups) — proper
  flat-lay proportions, cabled front, tape from side seam to side seam.
- **The swatch helper** (`02ad33a`) — "Help me count my swatch" under the
  swatch fields; `swatchToGauge()` in `parse.js` turns stitches-over-width
  into the per-4-in or per-10-cm figure, for rows too.
- **Yardage scaled for gauge** (`262356b`) — `yarnAtGauge()` in `advice.js`
  multiplies the pattern's figure by `pg/ug` on the yarn card and in the
  table alike, with a postscript that shows both numbers and calls it a
  rough guide.
- **The weighing helper** — grams on a kitchen scale become skeins in the
  basket card, via `gramsToSkeins()`; the same disclosure pattern as the
  swatch helper.

For the record, the `nana-upgrades` branch was the dependency bumps — React
19, Vite 8, plugin-react 6, Tailwind 4.3 — installed fresh, built, tested and
clicked through, together with a day of fixes that came out of a full audit:

- every single-value field reads through a comma-aware `parseOne` (a Spanish
  knitter's `17,5` used to lose its half to `parseFloat`), and the list parser
  learned dash runs, European ranges, and fractions — all pinned by tests
  (129 → 160);
- the saved notebook is validated on restore (a stored `easeIdx` of 7 used to
  crash the Ask button), tracking params no longer suppress it, and shared
  links always carry the sender's language;
- `Toggle`/`ParseEcho` moved to module scope (keyboard focus used to fall off
  the toggles), status messages re-word on a language switch and are announced
  to screen readers, and a handful of Spanish lines that read translated were
  polished — including `tallas de aguja` → `números`, which could be read as
  the opposite advice;
- the shop window: README with live link and screenshots, MIT LICENSE, an
  issue template in Nana's voice, `engines` field, and a Pages workflow that
  no longer cancels a deploy mid-flight.

`docs/REVIEW.md` is the audit that drove those priorities, and still ranks
what is left.

---

## What the app is

A single-page, client-side advisor. You tell Nana Purl about your pattern (the
finished sizes it offers, the yardage each needs, its stitch and row gauge),
about yourself (your measurement, how you like things to fit, your own gauge if
you swatched) and about your yarn basket. She answers with four cards: which
size to make, whether the yarn will stretch, what your tension does to the
width, and what your row gauge does to the length.

No backend, no account, no analytics. Numbers live in your browser or in a link
you choose to share.

Shipped features, in rough order of how much work they were:

- **Every size at a glance** — a table under the four cards comparing each
  pattern size: real gauge-adjusted measurement, distance from the aim,
  yardage, basket verdict, Nana's pick and any close call marked.
- **Bilingual** English / neutral Latin American Spanish, switchable at any time.
- **Share links** — every field encoded in the URL (`s` sizes, `y` yardage, `b`
  measurement, `pg`/`prg`/`mg`/`mrg` gauges, `ps`/`sk` basket, `u` units, `c`
  craft, `e` ease). Carries `?lang` so the recipient sees Nana in the sender's
  language, and auto-asks when the link has both sizes and a measurement.
- **"Nana, remember my numbers"** — localStorage, personal fields only, never the
  pattern's. Skipped when a shared link is present.
- **Print stylesheet** — everything but the advice drops away, so it goes in a
  project bag. Plus copy-as-text for Ravelry project notes.
- **Installable PWA**, offline app shell.
- **"How do I measure myself?"** guide with an illustrated sweater diagram.
- **"How does Nana figure it out?"** — the maths, explained in her voice.
- Hand-drawn SVG mascot, granny-square icons, scalloped edges, a bobbing
  animation that respects `prefers-reduced-motion`.

---

## What just happened (the session behind those two commits)

Rachel asked for a review of the whole repo and what would make it impressive.
The review produced a five-tier roadmap — it is still on disk, verbatim, at
`docs/REVIEW.md`, and is worth reading in full. She then chose to
start with "extract and test the maths", and asked for the work to be committed
once double-checked.

**What got done:**

*The arithmetic moved into `src/lib/` and grew tests.* 129 of them, on Node's
built-in runner. (Vitest was the plan; the npm registry was blocked in that
sandbox, so `node:test` won — and the accidental benefit is that CI runs the
suite with no `npm ci` at all, in seconds.)

*Testing the parser first showed how much it was getting wrong.* The old one
turned `32.5,36.5` into `[32.5]`, silently losing a size and then advising
confidently from a short list. `32-36` became `3236` — finite and positive, so
nothing downstream objected. `32,36` became `32.36`. All fixed, all encoded as
tests, and the parser now shows its reading back to the knitter instead of
guessing in private.

*Advice stopped being frozen in the language it was computed in.* Switching to
Spanish used to leave four cards of English on screen; switching to crochet left
Nana talking about needles. `results` now holds numbers, and the wording happens
at render.

*The size card stopped contradicting the tension card.* When gauge-adjusted, it
said "make the size 48, finished measurement 48 in" directly above a card
explaining it would really come out 41.1.

*Accessibility.* The toggles report `aria-pressed` (colour was the only thing
saying which was active), the inputs are a real `<form>` so Enter works, the
results scroll respects `prefers-reduced-motion`, the language buttons carry
`lang` attributes, and five palette colours were darkened by the *minimum*
amount that clears 4.5:1 — roseDark and sageDark moved about three hex points,
so the palette still looks like itself.

**How it was verified without a working build.** `node_modules` was installed on
macOS, so esbuild and rollup only had Darwin binaries and `vite build` could not
run in the Linux sandbox. Instead: a Babel-based parse and scope check over all
source files; an audit confirming all 91 i18n keys the component asks for resolve
in both languages; and a hand-rolled JSX transform that server-rendered the real
component — 24 full pages covering every advice branch, both languages, both unit
systems — scanned for `undefined` leaking into sentences and for raw dictionary
keys reaching the page. The wording suite was mutation-tested (rename a Spanish
key, confirm three failures) to prove it was not passing vacuously.

**A bug that verification caught, worth knowing about:** making the wording live
meant the cards started reading units off the *current* toggle. Ask in inches,
flip to cm, and "40 in" silently became "40 cm". `results.inch` had been stored
for exactly this and never wired up. Fixed, and now documented as an invariant
in `CLAUDE.md` — it is the sort of thing that only shows up if you actually
render the results.

**Deliberately not fixed:** `shareLink()` writes into the same message slot as
"Nana remembered you from last time", so one clobbers the other. On reflection
"newest message wins" is arguably correct, and separating them added risk for
near-zero value. Still open if you disagree.

---

## Where it stands

- 202 tests, 31 suites, all passing, ~75 ms, zero dependencies.
- CI: `test.yml` runs the suite on pull requests; `deploy.yml` runs it before
  building, so a red suite blocks the live site.
- Both dictionaries at 134 keys, parity enforced by test in both directions,
  including that a key is the same *kind* of thing (string vs function) in each.
- `NanaKnows.jsx` is about 1,410 lines.

---

## Where to take it next

The review ranked all of this. Condensed, with the reasoning that mattered:

### The shop window — cheapest, highest impression-per-hour

This is the biggest gap now that the maths is tested, and it is mostly writing.

1. **The README is out of date and does not sell the project.** It still has a
   placeholder `https://<your-username>.github.io/nana-knows/` instead of the
   live link. It has no screenshot — so Nana Purl herself, the best asset in the
   project, is invisible until someone clones and runs it. It lists shareable
   links under "Someday" though they shipped months ago, and never mentions
   Spanish, the PWA, print-to-project-bag, copy-for-Ravelry, or the measuring
   guide. A README opening with the live link, a screenshot of Nana giving
   advice, and the real feature list would change the impression of this repo
   more than any code change.
2. **There is no LICENSE.** The README says "free forever" and the footer says
   "never sold, never shared", but legally it is all-rights-reserved and nobody
   can fork it. MIT fits the tone.
3. **An issue template in Nana's voice.** The footer already invites people to
   "Tell Nana what to learn next" and then drops them on a blank form. Twenty
   lines of YAML, and completely on-brand.
4. Smaller furniture: `CONTRIBUTING.md`, `SECURITY.md`, Dependabot, ESLint +
   Prettier (there is no linter at all), and an `engines` field or `.nvmrc`
   pinning the Node 22 that CI uses.

### Features knitters would actually notice

Ordered by value per hour. All respect the no-backend rule.

1. ~~**A swatch-to-gauge helper.**~~ Shipped 1 September 2026: a "Help me
   count my swatch" disclosure under the swatch fields, backed by
   `swatchToGauge()` in `parse.js`. Stitches and rows, live arithmetic, and a
   button that writes the answer into the gauge fields.
2. ~~**An all-sizes comparison table.**~~ Shipped 31 August 2026 in `1c24f84`;
   see the top of this file. The README carries its screenshot.
3. ~~**Yarn estimate adjusted for gauge.**~~ Shipped 1 September 2026:
   `yarnAtGauge()` in `advice.js` scales the pattern's figure by `pg/ug` for
   the yarn card and the table alike, with a postscript that shows the
   pattern's number beside Nana's and calls it a rough guide.
4. **Multiple saved projects** — a named picker over the same localStorage. The
   natural follow-on now that share links exist.
5. **Grams as well as yards.** Half shipped 1 September 2026: the basket can
   be weighed ("Weighing your yarn instead?", backed by `gramsToSkeins()` in
   `parse.js`) and the result lands in the skeins field. Still open: a
   pattern that quotes its yarn in balls or grams per size rather than length.

### Structure, when it starts to hurt

`NanaKnows.jsx` holds the palette, three SVG illustrations, all the state, the
share/save/print plumbing and the whole layout. It is readable — the comments do
heavy lifting — but it is the file that makes an experienced reviewer wince. The
sketched split:

```
lib/share.js          buildShareUrl, readShareUrl
hooks/useNotebook.js  the localStorage dance
components/           Nana, GrannySquare, MeasureBust, AdviceCard,
                      PatternCard, YouCard, BasketCard
NanaKnows.jsx         ~150 lines of composition
```

Related: Tailwind v4 is installed but almost unused for colour. Moving the `C`
palette into an `@theme` block in `index.css` would let you write
`bg-card border-line text-espresso`, delete several hundred lines of inline style
objects, and make a `prefers-color-scheme: dark` variant a small change instead
of a rewrite.

### Accessibility leftovers

The colour and toggle work is done, and so — as of 1 September 2026 — is the
results announcement: a one-sentence `role="status"` line ("Nana has your
answer, dear: the size 48") replaces the polite region that used to read all
four cards in one breath, and focus lands on the results heading so the cards
are read at the reader's own pace. Shared-link parameters are capped at 120
characters (`MAX_PARAM`). Nothing is known to be open here.

---

## Practical notes

- Commit as Rachel: `git -c user.name=rachelselbrede -c user.email=rachel.selbrede@gmail.com commit`
  if the environment has no git identity, rather than writing to her config.
- The GitHub Pages source must stay set to "GitHub Actions" in repo settings.
- `dev-dist/` is generated by the dev-mode PWA and is gitignored.
- If you are in a sandbox: github.com and the npm registry may be blocked, and
  `node_modules` installed on macOS will not run Vite on Linux. Tests still work.
