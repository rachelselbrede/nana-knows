# Nana Knows — code review and next-steps roadmap

Reviewed at commit `4b5fed4`, August 2026. 1,585 lines of source across six files.

## The short version

This is already a good project. The voice is consistent and genuinely charming, the
comments explain *why* rather than *what*, the commit messages read like sentences a
person wrote, the i18n keys are at full parity between English and Spanish, and the
privacy story is honest and simple. Most side projects do not get this far.

What separates it from an *impressive* project is that the thing it is actually selling —
the arithmetic — is untested, unextracted, and has real bugs in it. Fix that first, then
fix the shop window (README, licence), then add the features.

---

## Tier 1 — Correctness bugs

### 1. Advice does not re-translate when the language is switched

`askNana()` builds finished strings via `t()` and stores them in `results`. Switching
EN → ES afterwards re-renders the component but leaves the four advice cards in the old
language, and there is no way to refresh them short of asking again.

Switching craft has the same problem: the knit/crochet proverb and the
"try a larger needle / hook" wording are both baked in at compute time.

**Fix:** store the computed *numbers and tone flags* in `results`, and call `t()` during
render. This is also the change that makes the maths testable, so it pays for itself
twice.

### 2. The list parser silently mangles several plausible inputs

Verified against the current `parseList`:

| Typed | Parsed as | Should be |
| --- | --- | --- |
| `32.5,36.5` | `[32.5]` | `[32.5, 36.5]` — **a size is silently dropped** |
| `32,36` | `[32.36]` | `[32, 36]` |
| `32-36` | `[3236]` | a range, or a rejection |
| `1,100,1,250` | `[1, 100, 1, 250]` | `[1100, 1250]` |

The single-comma heuristic is documented and thoughtful, but `32.5,36.5` losing a size
without complaint is the dangerous one — Nana then recommends confidently from a
short list. `32-36` producing `3236` is the same class of failure: the result is
finite and positive, so nothing downstream objects.

**Fix, in order of value:** (a) reject a token that still contains a `.` *and* a `,`;
(b) treat `-` and `–` between two numbers as a range separator or an explicit error;
(c) **echo the parse back to the user** — a small "Nana read: 32, 36, 40, 44" line under
the field. That single UI addition makes every remaining ambiguity self-correcting, and
it is very much in character for her.

### 3. The size card contradicts the tension card

When a personal gauge is supplied, `fitOf()` correctly picks the size whose *real* width
lands nearest the target — so at pg 18 / ug 21 and a 40 in target, it picks size 44. The
size card then says "the one with a finished measurement of 44 in", and the tension card
says it will come out at 37.7 in. Both are true, but read together they look like a bug.

**Fix:** when gauge-adjusted, say the finished measurement *in your hands* on the size
card and mention the pattern's own number second.

### 4. Gauge is not converted on the unit flip

`switchUnits()` deliberately leaves gauge alone on the grounds that 4 in and 10 cm are
"the same swatch". They are not quite: 4 in is 10.16 cm, so the label changes under a
number that did not, introducing about 1.6% error into the row-length maths (where
`swatchSpan` *is* used as an absolute, not a ratio). It cancels in the `ug/pg`
comparison, but not in `intended = (100 / prg) * swatchSpan`.

1.6% is under a quarter-inch on a sweater body, so this is a footnote rather than a
crisis — but it should be a deliberate, documented footnote rather than an accident.

### 5. Smaller things

- `shareLink()` writes to `saveMsg`, clobbering "Nana remembered you from last time."
  Give sharing its own message slot.
- Runner-up selection picks the size numerically closest to the winner, not the
  second-best *fit*. With unevenly spaced size ranges these differ.
- URL parameters are read with no length cap. React escapes them so there is no XSS,
  but a 50 kB `?b=` value will still render.

---

## Tier 2 — What makes a repo look professional

### 6. There are no tests

This is the single biggest gap. The whole product is a calculator, and nothing verifies
it. Extract the pure functions into `src/lib/` — `parseList`, `convertOne`,
`pickSize`, `checkYarn`, `checkGauge`, `checkRows` — add Vitest, and write the table of
cases from bug #2 above as the first test file. Roughly 40 assertions would cover the
entire decision surface.

Then add a `ci.yml` that runs tests on pull requests. Right now the only workflow is
deploy, which means `main` is verified by nothing at all.

### 7. There is no LICENSE

The README says "free forever" and the footer says "never sold, never shared", but with
no licence file the code is legally all-rights-reserved. Nobody can fork it, and GitHub
shows no licence badge. MIT is the obvious fit for the tone.

### 8. The README is out of date and does not sell the project

It is the first thing anyone sees, and right now it:

- does not link to the live site (it shows the placeholder
  `https://<your-username>.github.io/nana-knows/`)
- has no screenshot or GIF, so Nana Purl herself — the best asset in the project —
  is invisible until someone clones and runs it
- lists "shareable result links" under **Someday** when they shipped in `b0c7d1e`
- never mentions Spanish, offline/PWA install, print-to-project-bag, copy-for-Ravelry,
  or the how-to-measure guide

A README that opened with the live link, a screenshot of Nana giving advice, and the
real feature list would change the impression of this repo more than any code change.

### 9. Missing repo furniture

`CONTRIBUTING.md`, a `SECURITY.md`, Dependabot config, and — most on-brand — a custom
issue template. The footer already invites people to "Tell Nana what to learn next" and
drops them on a blank issue form. A template in Nana's voice would be a delightful touch
that costs twenty lines of YAML.

Also worth adding: ESLint + Prettier config (there is none), and an `engines` field or
`.nvmrc` matching the Node 22 the workflow uses.

---

## Tier 3 — Accessibility

Measured, not guessed. Contrast ratios against the actual palette:

| Combination | Ratio | WCAG AA (4.5:1 for small text) |
| --- | --- | --- |
| Placeholder `#B9A68F` on white | 2.36 | fail |
| Unselected toggle text `#D4718C` on oat | 2.98 | fail |
| Share note / "Forget me" `#A08B74` on oat | 3.03 | fail |
| Footer privacy `#8A755F` on oat | 4.07 | fail |
| Field labels `#8A755F` on card | 4.31 | fail |
| White on the rose "Ask Nana" button | 3.21 | fail (passes as large text) |
| White on the sage language toggle | 3.07 | fail |
| Body copy `#5C4B3E` on card | 8.17 | pass |

Darkening the four warm greys by roughly 15% would fix most of this without touching the
palette's character. The rose and sage need a darker variant reserved for text.

Beyond colour:

- **The craft and unit toggles have no `aria-pressed`.** The language toggle has it; these
  do not. A screen reader user cannot tell whether they are in knit or crochet mode.
  This is the clearest a11y bug in the app.
- **The form is not a `<form>`.** Pressing Enter in any input does nothing. Wrapping the
  three cards in `<form onSubmit={askNana}>` makes Enter work and costs nothing.
- `scrollIntoView({ behavior: "smooth" })` ignores `prefers-reduced-motion`, even though
  the CSS animations respect it.
- The Spanish button's `aria-label="Cambiar a español"` should carry `lang="es"` so it is
  pronounced correctly.
- When results appear, focus is not moved. The `aria-live="polite"` region announces all
  four cards at once. A short status line plus a focusable results heading would read
  better.

---

## Tier 4 — Architecture

`NanaKnows.jsx` is 1,000 lines holding the palette, three SVG illustrations, all the
maths, all the state, the share/save/print plumbing, and the entire layout. It is
readable — the comments are doing heavy lifting — but it is the file that will make an
experienced reviewer wince.

A natural split:

```
src/
  lib/parse.js        parseList, convertOne, convertList
  lib/advice.js       pickSize, checkYarn, checkGauge, checkRows  ← the tested core
  lib/share.js        buildShareUrl, readShareUrl
  hooks/useNotebook.js
  components/Nana.jsx, GrannySquare.jsx, MeasureBust.jsx, AdviceCard.jsx
  components/PatternCard.jsx, YouCard.jsx, BasketCard.jsx
  NanaKnows.jsx       ~150 lines of composition
```

Separately: Tailwind v4 is installed but almost unused for colour — every colour is an
inline `style={{}}`. Moving the `C` palette into an `@theme` block in `index.css` would
let you write `bg-card border-line text-espresso`, delete several hundred lines of inline
style objects, and make a `prefers-color-scheme: dark` variant a genuinely small change
instead of a rewrite.

---

## Tier 5 — Features that would actually impress knitters

Ordered by value-per-hour, and all of them respect the no-backend rule.

1. **A swatch-to-gauge helper.** Right now the user must normalise "I counted 22 stitches
   over 4.25 inches" to a per-4-in figure by hand — which is exactly the arithmetic Nana
   exists to do. A small popover taking stitches counted and width measured is the most
   Nana-ish feature not yet built.

2. **An all-sizes comparison table.** Instead of one recommendation, show every size with
   its pattern measurement, its gauge-adjusted real measurement, its yardage, and a
   tick or cross against the stash. It turns a calculator into a decision tool, demos
   beautifully in a screenshot, and reuses maths that already exists.

3. **Needle/hook size guidance with a number.** "Try a larger needle" could be "you are
   3 stitches per 4 in tight; that is usually about one and a half needle sizes up."
   The rule of thumb is roughly 1 size ≈ 2 stitches per 4 in.

4. **Yarn estimate adjusted for gauge.** If you knit looser than the pattern, the same
   stitch counts eat more yarn. Even a caveated first-order adjustment (scale by `pg/ug`,
   with an honest "this is a rough guide, dear") is more useful than ignoring it.

5. **Multiple saved projects.** Already in the README's Someday list, and the natural
   follow-on now that share links exist — a named-project picker over the same
   localStorage.

6. **Grams as well as yards.** Many European ball bands lead with weight.

---

## If you only do three things

1. Extract the maths into `src/lib/`, add Vitest, and write the parser bug table as tests.
   This fixes the language-switch bug as a side effect and makes everything else safer.
2. Rewrite the README with the live link, a screenshot of Nana, and the real feature
   list — and add a LICENSE.
3. Fix the `aria-pressed` toggles, wrap the inputs in a `<form>`, and darken the four
   failing text colours.

That is roughly a weekend, and it moves the project from "charming personal side project"
to "well-built small product that happens to be charming."
