# Nana Knows 👵 🧶

Tell Nana Purl about your pattern, your yarn, and yourself. She tells you what size to make, whether your stash will stretch, and what your gauge is up to.

Free forever. No account. Nothing collected. Knit and crochet both welcome.

## What it does

- Recommends which pattern size to make from your body measurement plus your preferred ease
- Checks whether the yarn in your basket covers that size, with a 10% just-in-case cushion
- Adjusts for your personal gauge, so the size you follow matches what actually comes off your needles or hook
- "Nana, remember my numbers" saves your details in your own browser (localStorage) and nowhere else

## Run it locally

```bash
npm install
npm run dev
```

Then open the local address Vite prints (usually http://localhost:5173).

## Deploying

Pushing to the `main` branch triggers `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages.

One-time setup in the GitHub repo: Settings → Pages → set Source to "GitHub Actions".

The live site appears at: `https://<your-username>.github.io/nana-knows/`

Note: `base` in `vite.config.js` is set to `/nana-knows/` and must match the repo name. If you later use a custom domain, change `base` to `/`.

## Privacy

Nana collects nothing. There is no backend, no analytics, and no cookies. Saved numbers live only in the visitor's own browser.

Made with love and leftover yarn.
