# Helping Nana

Pull up a chair, dear. Nana Knows is a small project with a few firm habits,
and this page is the short version of them. *También puedes escribir en
español; Nana lo habla.*

## Before you write any code

For anything bigger than a typo, open an issue first — the footer's "Tell
Nana what to learn next" link lands on a form made for it. It saves you
building something that cannot be merged, and there is one rule that decides
that more often than any other:

**No backend, no accounts, no analytics, no cookies, no third-party
requests.** Everything Nana works out, she works out in the visitor's own
browser. A feature that needs a server is a different project.

## Running her

You need Node 22.12 or newer.

```bash
npm ci
npm run dev
```

## The checks

Every pull request runs these, and so does every deploy. Run them yourself
first and nothing will surprise you.

```bash
npm test                         # the arithmetic and the words, in well under a second
npm run lint                     # ESLint: real mistakes, no opinions about layout
npm run format:check             # Prettier: layout, so nobody has to argue about it
npm run build && npm run smoke   # the built page, driven through headless Chrome
```

`npm run format` fixes what `format:check` complains about. If you touch a
colour, run `npm run contrast` as well.

The smoke run writes down every sentence the page showed it and compares
that with `scripts/smoke.golden.txt`. If you changed what a visitor sees on
purpose, re-record it with `npm run smoke:update` and commit the golden **in
the same commit**: its diff is the record of what changed for her. If the
golden changed and you did not mean it to, that is the smoke run doing its
job.

## The habits that hold the place up

`CLAUDE.md` has the full list under "Invariants", with the reason for each.
The ones most likely to catch a new pair of hands:

- **Two dictionaries, always.** Every word Nana says lives in both
  `src/i18n/en.js` and `src/i18n/es.js`. The wording suite fails loudly if a
  key is in one and not the other.
- **Results hold numbers, never sentences.** The sentences are built at
  render time in `src/lib/words.js`, which is what lets the advice re-word
  itself when the language or the craft changes. Do not build a sentence
  inside `askNana()`.
- **The parser guesses, and says so.** If you teach it a new way to read a
  number, make sure the echo under the field still shows the knitter what was
  read. A wrong guess she can see beats a clever one she cannot.
- **Arithmetic goes in `src/lib`**, pure and tested, with no React and no
  language in it. Components draw; they do not calculate.
- **Colours come from `src/palette.js`** by role (`ink`, `label`,
  `roseText`), never as a hex typed into a component.

## Nana's voice

She is a warm grandmother, not a machine. She says "dear" and "mija" and
never "Error:". She gives the instruction and stops; she does not add a
moral to the end of it. In Spanish she is a neutral Latin American abuela,
diminutives and all. "Nana Purl" is never translated.

## Commits and comments

Comments explain why, not what. Commit messages are a few plain paragraphs
that describe the problem before the fix, the way you would explain it to
someone across the table. Have a look at `git log` and match that; it is
most of what makes this repository pleasant to read.

By contributing you agree that your work is offered under the project's
[MIT licence](LICENSE).
