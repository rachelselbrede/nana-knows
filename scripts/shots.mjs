#!/usr/bin/env node
/* The README's three pictures.
   ---------------------------------------------------------------------------
   They go stale with every change a visitor can see — a badge reworded, a
   helper added under a field, a sentence trimmed on a card — and retaking
   them by hand means remembering the width, the numbers and the crop each
   time. This takes them from the built site, the same way every time:

     nana-hero.png     the empty form, down to just past the pattern card
     nana-advice.png   Nana's intro and her four cards
     nana-table.png    every size at a glance

   780 pixels wide at a device scale of 1, the light palette, reduced motion so
   Nana is standing still rather than caught mid-bob, and the smoke run's own
   fixture. The proverb is random on the page, so it is pinned here: the
   pictures should change when the page does, not when the dice do. Run
   `npm run build` first; a run against an unchanged build rewrites the three
   files byte for byte, so `git status` says whether anything really moved. */

import { writeFileSync } from "node:fs";
import path from "node:path";
import { ROOT, baseUrl, serveDist, openChrome, sleep } from "./chrome.mjs";

const PORT = 4181;
const BASE = baseUrl(PORT);
const OUT = path.join(ROOT, "docs", "images");
const WIDTH = 780;
/* The cream that shows around a card, above and below it. */
const MARGIN = 16;

/* Fill the form the way React needs, ask, and leave nothing focused: a focus
   ring in a picture reads as something being wrong. Math.random is pinned
   first so the proverb is the last of the knitting five. */
const ASK = String.raw`(async () => {
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  const fill = (el, v) => { set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); };
  const byPh = (ph) => Array.from(document.querySelectorAll('form input')).find(i => i.placeholder === ph);
  fill(byPh('e.g. 18'), '18'); fill(byPh('e.g. 24'), '24');
  fill(document.querySelector('#nk-sizes'), '32, 36, 40, 44, 48, 52');
  fill(document.querySelector('#nk-yards'), '900, 1000, 1100, 1250, 1400, 1550');
  fill(byPh('e.g. 38'), '38'); fill(byPh('e.g. 19'), '21'); fill(byPh('e.g. 26'), '26');
  fill(byPh('e.g. 220'), '220'); fill(byPh('e.g. 5'), '6');
  await new Promise(r => setTimeout(r, 100));
  Math.random = () => 0.99;
  Array.from(document.querySelectorAll('button')).find(b => /^Ask Nana$/.test(b.textContent.trim())).click();
  await new Promise(r => setTimeout(r, 900));
  if (document.activeElement) document.activeElement.blur();
  return true;
})()`;

/* The results column is the intro, the four cards, the table, then the
   buttons, in that order. Positions are in page coordinates. */
const RECTS = String.raw`(() => {
  const kids = Array.from(document.querySelector('.nk-results > div').children);
  const abs = (el) => { const r = el.getBoundingClientRect(); return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY }; };
  return { intro: abs(kids[0]), lastCard: abs(kids[4]), table: abs(kids[5]) };
})()`;

async function main() {
  const server = await serveDist(PORT);
  let page;
  try {
    page = await openChrome({ width: WIDTH, height: 1400 });
    await page.send("Emulation.setDeviceMetricsOverride", {
      width: WIDTH,
      height: 1400,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await page.send("Emulation.setEmulatedMedia", {
      features: [
        { name: "prefers-color-scheme", value: "light" },
        { name: "prefers-reduced-motion", value: "reduce" },
      ],
    });

    /* A notebook left over from another run would put the picker in the hero. */
    await page.go(BASE + "?lang=en");
    await page.eval("localStorage.clear(); true");
    await page.go(BASE + "?lang=en");
    await page.eval("document.fonts.ready.then(() => true)");
    await sleep(400);

    const shot = async (name, top, bottom) => {
      const clip = {
        x: 0,
        y: Math.round(top),
        width: WIDTH,
        height: Math.round(bottom - top),
        scale: 1,
      };
      const r = await page.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip,
      });
      writeFileSync(path.join(OUT, name), Buffer.from(r.result.data, "base64"));
      console.log(`✓ ${name}  ${clip.width}×${clip.height}`);
    };

    const cardBottom = await page.eval(
      "(() => { const r = document.querySelector('form section').getBoundingClientRect(); return r.bottom + window.scrollY; })()",
    );
    /* A little of the next card shows under the pattern card, so the page
       reads as continuing. */
    await shot("nana-hero.png", 0, cardBottom + 33);

    await page.eval(ASK);
    const r = await page.eval(RECTS);
    await shot("nana-advice.png", r.intro.top - MARGIN, r.lastCard.bottom + MARGIN);
    await shot("nana-table.png", r.table.top - MARGIN, r.table.bottom + MARGIN);

    if (page.errors.length) {
      console.error(
        "shots: the page logged an error while being photographed\n" + page.errors.join("\n"),
      );
      process.exitCode = 1;
    }
  } finally {
    if (page) await page.close();
    server.kill();
  }
}

main().catch((e) => {
  console.error("shots: " + (e.message || e));
  process.exit(1);
});
