#!/usr/bin/env node
/* Nana's smoke run.
   ---------------------------------------------------------------------------
   The unit suite proves the arithmetic and the words. It cannot see the things
   that only exist in a browser: that a designer's link meets the notebook,
   that a helper's width follows the unit toggle, that focus lands on the
   answer, that the copied text carries the whole table. This script drives
   the built site through headless Chrome — every load path, every helper,
   every card — and writes down what it saw.

   The transcript is compared with scripts/smoke.golden.txt. Any difference
   fails the run, and so does any console error. A change that alters what the
   visitor sees on purpose re-records the golden with `npm run smoke:update`,
   and the diff in that commit shows exactly what changed for her.

   No dependencies: Node's own fetch and WebSocket, the DevTools protocol, and
   whichever Chrome is installed (CHROME_PATH overrides the search). It serves
   dist/ with `vite preview`, so run `npm run build` first. */

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import en from "../src/i18n/en.js";
import es from "../src/i18n/es.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GOLDEN = path.join(ROOT, "scripts", "smoke.golden.txt");
const LAST = path.join(ROOT, "scripts", "smoke.last.txt");
const PORT = 4179;
const BASE = `http://127.0.0.1:${PORT}/nana-knows/`;
const update = process.argv.includes("--update");

const CHROME =
  process.env.CHROME_PATH ||
  [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ].find(existsSync);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- the scenarios ----------
   Each runs in the page as one async function and returns plain data. They
   fill fields the way React needs (the native setter plus an input event),
   click by button text, and read back text — never colours or geometry, so
   the transcript is the same on every machine. Proverbs are random, so the
   one place they can show is stripped in the scenario itself. */

/* The same helpers, prepended to every scenario. */
const PRELUDE = String.raw`
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
const fill = (el, v) => { set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); };
const byPh = (ph) => Array.from(document.querySelectorAll('form input')).find(i => i.placeholder === ph);
const clickBtn = (re) => Array.from(document.querySelectorAll('button')).find(b => re.test(b.textContent.trim())).click();
const enter = (el) => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
const answered = () => /Here is what Nana thinks|Esto es lo que piensa/.test(document.body.innerText);
const openDetails = (re) => { const d = Array.from(document.querySelectorAll('summary')).find(s => re.test(s.textContent)).closest('details'); d.open = true; return d; };
const statusesIn = (d) => Array.from(d.querySelectorAll('[role="status"]')).map(s => s.textContent.trim());
const fillFixture = () => {
  fill(byPh('e.g. 18'), '18'); fill(byPh('e.g. 24'), '24');
  fill(document.querySelector('#nk-sizes'), '32, 36, 40, 44, 48, 52');
  fill(document.querySelector('#nk-yards'), '900, 1000, 1100, 1250, 1400, 1550');
  fill(byPh('e.g. 38'), '38'); fill(byPh('e.g. 19'), '21'); fill(byPh('e.g. 26'), '26');
  fill(byPh('e.g. 220'), '220'); fill(byPh('e.g. 5'), '6');
};
`;

const SCENARIOS = [
  {
    name: "cards, table, copy, language, gauge scaling",
    js: String.raw`
fillFixture(); await sleep(100);
window.__copied = null; navigator.clipboard.writeText = (s) => { window.__copied = s; return Promise.resolve(); };
clickBtn(/^Ask Nana$/); await sleep(400);
const card = (re) => (document.querySelector('.nk-results').innerText.match(re) || [])[1];
const yarnCard = () => card(/(?:Your yarn basket|Tu canasta de lana)\n([\s\S]*?)\n\n(?:Your tension|Tu tensión)/);
const sizeCard = () => card(/(?:The right size|La talla justa)\n([\s\S]*?)\n\n/);
const table = () => { const tbl = document.querySelector('table'); return { headers: Array.from(tbl.querySelectorAll('thead th')).map(t => t.textContent.trim()), rows: Array.from(tbl.querySelectorAll('tbody tr')).map(tr => Array.from(tr.children).map(c => c.textContent.trim()).join(' | ')), note: tbl.closest('div').parentElement.querySelector('p').textContent.trim() }; };
const out = {};
out.en = { size: sizeCard(), yarn: yarnCard(), table: table() };
clickBtn(/Copy Nana's advice/); await sleep(300);
out.copied = window.__copied.split('\n').slice(4).join('\n');
clickBtn(/^ES$/); await sleep(300);
out.es = { size: sizeCard(), yarn: yarnCard(), note: table().note, row48: table().rows[4] };
clickBtn(/^EN$/); await sleep(200);
clickBtn(/^Crochet$/); await sleep(200);
out.crochet = card(/Your tension\n([\s\S]*?)\n\n/);
clickBtn(/^Knitting$/); await sleep(100);
fill(byPh('e.g. 19'), '16'); await sleep(50); clickBtn(/^Ask Nana$/); await sleep(400);
out.loose = { yarn: yarnCard(), row40: table().rows[2] };
fill(byPh('e.g. 19'), '18'); await sleep(50); clickBtn(/^Ask Nana$/); await sleep(400);
out.match = { yarn: yarnCard(), note: table().note };
return out;`,
  },
  {
    name: "units flip after asking",
    js: String.raw`
fillFixture(); await sleep(100);
clickBtn(/^Ask Nana$/); await sleep(400);
const out = { asked: answered() };
clickBtn(/^cm \/ m$/); await sleep(300);
out.afterFlip = { answered: answered(), fields: Array.from(document.querySelectorAll('form input')).slice(0, 9).map(i => i.value), message: Array.from(document.querySelectorAll('[role="status"]')).map(s => s.textContent.trim()).find(t => /Nana redid/.test(t)) };
clickBtn(/^Ask Nana$/); await sleep(400);
const tbl = document.querySelector('table');
out.metric = { headers: Array.from(tbl.querySelectorAll('thead th')).map(t => t.textContent.trim()), pick: Array.from(tbl.querySelectorAll('tbody tr')).map(tr => tr.textContent.trim()).find(t => /Nana's pick/.test(t)) };
return out;`,
  },
  {
    name: "the swatch helper",
    js: String.raw`
const det = openDetails(/count my swatch/i);
const hin = () => Array.from(det.querySelectorAll('input'));
const you = () => [byPh('e.g. 19') || byPh('p. ej. 19'), byPh('e.g. 26') || byPh('p. ej. 26')].map(i => i.value);
const out = {};
['22', '4.25', '30', '4.5'].forEach((v, i) => fill(hin()[i], v)); await sleep(150);
out.filled = { statuses: statusesIn(det), buttonDisabled: det.querySelector('button').disabled };
det.querySelector('button').click(); await sleep(150);
out.afterUse = { fields: you(), used: statusesIn(det)[2] };
fill(hin()[0], '23'); await sleep(100);
out.afterEdit = { used: statusesIn(det)[2], sts: statusesIn(det)[0] };
enter(hin()[0]); await sleep(150);
out.afterEnter = { fields: you(), used: statusesIn(det)[2], askedNana: answered() };
clickBtn(/^ES$/); await sleep(200);
out.es = { statuses: statusesIn(det) };
clickBtn(/^cm \/ m$/); await sleep(300);
out.cm = { widths: [hin()[1].value, hin()[3].value], statuses: statusesIn(det), fields: you() };
clickBtn(/^in \/ yds$/); await sleep(200); clickBtn(/^EN$/); await sleep(150);
out.back = { widths: [hin()[1].value, hin()[3].value], fields: you() };
return out;`,
  },
  {
    name: "the weighing helper",
    js: String.raw`
const det = openDetails(/weighing your yarn/i);
const hin = () => Array.from(det.querySelectorAll('input'));
const skeinsField = () => byPh('e.g. 5') || byPh('p. ej. 5');
const out = {};
out.labels = Array.from(det.querySelectorAll('label span')).map(s => s.textContent.trim());
fill(hin()[0], '100'); fill(hin()[1], '350'); await sleep(150);
out.noPerSkein = { statuses: statusesIn(det), disabled: det.querySelector('button').disabled };
fill(byPh('e.g. 220'), '220'); await sleep(150);
out.withPerSkein = { statuses: statusesIn(det) };
det.querySelector('button').click(); await sleep(150);
out.afterUse = { skeins: skeinsField().value, used: statusesIn(det)[1] };
fill(hin()[1], '100'); await sleep(150);
out.oneSkein = { statuses: statusesIn(det) };
fill(hin()[1], '37'); fill(hin()[0], '50'); await sleep(100);
enter(hin()[1]); await sleep(150);
out.afterEnter = { skeins: skeinsField().value, used: statusesIn(det)[1], askedNana: answered() };
clickBtn(/^ES$/); await sleep(200);
out.es = { summary: det.querySelector('summary').textContent.trim(), statuses: statusesIn(det) };
clickBtn(/^cm \/ m$/); await sleep(300);
out.cm = { statuses: statusesIn(det), perSkein: byPh('p. ej. 200').value, grams: [hin()[0].value, hin()[1].value] };
clickBtn(/^in \/ yds$/); await sleep(100); clickBtn(/^EN$/); await sleep(150);
return out;`,
  },
  {
    name: "the substitution helper",
    js: String.raw`
const det = openDetails(/work instead|otra lana/i);
const band = () => det.querySelector('input');
const out = {};
fill(band(), '19'); await sleep(120);
out.noPatternGauge = statusesIn(det);
fill(byPh('e.g. 18'), '18'); await sleep(120);
out.close = statusesIn(det);
fill(band(), '21'); await sleep(120); out.stretch = statusesIn(det);
fill(band(), '22'); await sleep(120); out.no = statusesIn(det);
fill(band(), '18'); await sleep(120); out.match = statusesIn(det);
fill(band(), '15'); await sleep(120); out.heavier = statusesIn(det)[0];
clickBtn(/^Crochet$/); await sleep(120); out.crochet = statusesIn(det)[0]; clickBtn(/^Knitting$/); await sleep(60);
fill(band(), '19');
fill(document.querySelector('#nk-sizes'), '32, 36, 40, 44, 48, 52'); fill(document.querySelector('#nk-yards'), '900, 1000, 1100, 1250, 1400, 1550');
fill(byPh('e.g. 38'), '38'); fill(byPh('e.g. 220'), '220'); await sleep(60);
clickBtn(/^Ask Nana$/); await sleep(400);
out.afterAsk = statusesIn(det);
fill(byPh('e.g. 220'), ''); await sleep(120); out.noPerSkein = statusesIn(det)[1]; fill(byPh('e.g. 220'), '220'); await sleep(60);
clickBtn(/^ES$/); await sleep(200); out.es = statusesIn(det);
clickBtn(/^cm \/ m$/); await sleep(300); out.cm = { band: band().value, lines: statusesIn(det) };
clickBtn(/^in \/ yds$/); await sleep(100); clickBtn(/^EN$/); await sleep(100);
return out;`,
  },
  {
    name: "a line pasted from the pattern",
    js: String.raw`
const echo = (id) => document.getElementById(id).textContent.trim();
const out = {};
out.placeholders = [document.querySelector('#nk-sizes').placeholder, document.querySelector('#nk-yards').placeholder];
fill(document.querySelector('#nk-sizes'), 'Finished bust: 32 (36, 40, 44, 48, 52) in'); await sleep(100);
out.sizesEcho = echo('nk-sizes-echo');
fill(document.querySelector('#nk-yards'), 'Size 1 (2, 3, 4, 5, 6): 900 (1000, 1100, 1250, 1400, 1550) yds'); await sleep(100);
out.yardsEcho = echo('nk-yards-echo');
fill(document.querySelector('#nk-sizes'), '32(36,40,44,48,52)'); await sleep(100);
out.noSpacesEcho = echo('nk-sizes-echo');
fill(document.querySelector('#nk-sizes'), '32-36'); await sleep(100);
out.rangeEcho = echo('nk-sizes-echo');
clickBtn(/^ES$/); await sleep(200);
out.esYardsEcho = echo('nk-yards-echo');
clickBtn(/^EN$/); await sleep(100);
return out;`,
  },
  {
    name: "what a screen reader hears",
    js: String.raw`
const live = () => document.querySelector('p[role="status"].sr-only');
const strip = (s) => s.replace(/^["“][^"”]*["”]\s*/, '');
const focused = () => { const a = document.activeElement; return a ? a.tagName + '.' + a.className.split(' ')[0] + ' :: ' + strip(a.textContent.trim()) : null; };
const out = {};
out.beforeAsk = { liveExists: !!live(), liveText: live().textContent, resultsAriaLive: document.querySelector('.nk-results').getAttribute('aria-live') };
fill(byPh('e.g. 18'), '18'); fill(document.querySelector('#nk-sizes'), '32, 36, 40, 44, 48, 52');
fill(byPh('e.g. 38'), '38'); fill(byPh('e.g. 19'), '21'); await sleep(50);
clickBtn(/^Ask Nana$/); await sleep(400);
out.afterAsk = { liveText: live().textContent, focused: focused(), headings: Array.from(document.querySelectorAll('.nk-results h2, .nk-results h3')).map(h => h.tagName + ': ' + strip(h.textContent.trim())) };
clickBtn(/^ES$/); await sleep(200);
out.es = { liveText: live().textContent };
clickBtn(/^EN$/); await sleep(100);
fill(document.querySelector('#nk-sizes'), ''); await sleep(50); clickBtn(/^Ask Nana$/); await sleep(400);
out.errorCase = { liveText: live().textContent, focused: focused() };
return out;`,
  },
  {
    name: "the two notes at the foot",
    js: String.raw`
const d = openDetails(/designer/i);
const m = openDetails(/figure it out/i);
const out = { designers: { summary: d.querySelector('summary').textContent.trim(), steps: d.querySelectorAll('li').length, intro: d.querySelector('p').textContent.trim() }, math: Array.from(m.querySelectorAll('p')).map(p => p.textContent.trim()), order: Array.from(document.querySelectorAll('summary')).map(s => s.textContent.trim()) };
clickBtn(/^ES$/); await sleep(200);
out.es = Array.from(document.querySelectorAll('summary')).map(s => s.textContent.trim());
return out;`,
  },
  {
    name: "remember me, forget me, share",
    js: String.raw`
window.__copied = null; navigator.clipboard.writeText = (s) => { window.__copied = s; return Promise.resolve(); };
fill(byPh('e.g. 18'), '18'); fill(document.querySelector('#nk-sizes'), '32, 36'); fill(byPh('e.g. 38'), '38'); fill(byPh('e.g. 19'), '21'); await sleep(50);
const msg = () => Array.from(document.querySelectorAll('[role="status"]')).map(s => s.textContent.trim()).filter(Boolean).find(t => /Nana|Link|Written|Copied/.test(t)) || '';
const out = {};
clickBtn(/Copy a link/); await sleep(200);
out.link = { search: new URL(window.__copied).search, message: msg() };
clickBtn(/remember my numbers/); await sleep(150);
out.remembered = { stored: JSON.parse(localStorage.getItem('nana-notebook')), message: msg() };
clickBtn(/^Forget me$/); await sleep(150);
out.forgotten = { stored: localStorage.getItem('nana-notebook'), message: msg() };
return out;`,
  },
];

/* Load paths need more than one navigation, and a seeded notebook, so they
   are written against the page directly rather than as one script. */
const READ = String.raw`JSON.stringify({ bust: document.querySelectorAll('form input')[4].value, units: Array.from(document.querySelectorAll('button')).find(b => /in \/ yds|cm \/ m/.test(b.textContent) && b.getAttribute('aria-pressed') === 'true').textContent.trim(), fields: Array.from(document.querySelectorAll('form input')).slice(0, 9).map(i => i.value), msg: Array.from(document.querySelectorAll('[role="status"]')).map(s => s.textContent.trim()).filter(Boolean).find(t => /Nana (opened|remembered|abrió)/.test(t)) || '', answered: /Here is what Nana thinks|Esto es lo que piensa/.test(document.body.innerText), size: (document.body.innerText.match(/(?:Follow|Make) the size (\d+)/) || [])[1] || null })`;

async function loadPaths(page) {
  await page.go(BASE + "?lang=en");
  await page.eval(`localStorage.setItem('nana-notebook', JSON.stringify({ units: 'in', craft: 'knit', bust: '38', easeIdx: 2, myGauge: '21', myRowGauge: '26', perSkein: '220', skeins: '6' })); true`);
  const read = async () => JSON.parse(await page.eval(READ));
  const out = {};
  await page.go(BASE + "?lang=en"); out.noLink = await read();
  await page.go(BASE + "?s=32,36,40,44,48,52&y=900,1000,1100,1250,1400,1550&pg=18&prg=24&u=in&c=knit&lang=en"); out.designerLinkInches = await read();
  await page.go(BASE + "?s=81,91,102,112,122,132&y=825,915,1005,1145,1280,1420&pg=17.7&prg=23.6&u=cm&c=knit&lang=en"); out.designerLinkCentimetres = await read();
  await page.go(BASE + "?s=32,36,40,44,48,52&b=40&u=in&lang=en"); out.personalLink = await read();
  await page.go(BASE + "?s=32,36,40&b=" + "9".repeat(5000) + "&lang=en");
  out.longParam = { bustLength: await page.eval("document.querySelectorAll('form input')[4].value.length"), answered: await page.eval("/Here is what Nana thinks/.test(document.body.innerText)") };
  return out;
}

/* ---------- the machinery ---------- */

async function serveDist() {
  if (!existsSync(path.join(ROOT, "dist", "index.html"))) {
    throw new Error("dist/ is missing — run `npm run build` first");
  }
  const vite = path.join(ROOT, "node_modules", "vite", "bin", "vite.js");
  const server = spawn(process.execPath, [vite, "preview", "--port", String(PORT), "--strictPort", "--host", "127.0.0.1"], { cwd: ROOT, stdio: "ignore" });
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(BASE)).ok) return server;
    } catch (e) {
      /* not up yet */
    }
    await sleep(250);
  }
  server.kill();
  throw new Error("the preview server never answered");
}

async function openChrome() {
  if (!CHROME) throw new Error("no Chrome found; set CHROME_PATH");
  const profile = mkdtempSync(path.join(tmpdir(), "nana-smoke-"));
  const port = 9377;
  const flags = ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${port}`, "--window-size=900,1400", `--user-data-dir=${profile}`];
  if (process.platform === "linux") flags.push("--disable-dev-shm-usage");
  if (process.env.CI) flags.push("--no-sandbox");
  const chrome = spawn(CHROME, [...flags, "about:blank"], { stdio: "ignore" });
  let targets = null;
  for (let i = 0; i < 80 && !targets; i++) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    } catch (e) {
      await sleep(250);
    }
  }
  if (!targets) throw new Error("Chrome never answered on its debugging port");
  const target = targets.find((t) => t.type === "page");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
      errors.push("console.error: " + m.params.args.map((a) => a.value ?? a.description ?? "").join(" ").slice(0, 200));
    }
    if (m.method === "Runtime.exceptionThrown") {
      errors.push("exception: " + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 200));
    }
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Runtime.enable");
  await send("Page.enable");

  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) {
      throw new Error("in the page: " + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text));
    }
    return r.result?.result?.value;
  };
  const go = async (url) => {
    await send("Page.navigate", { url });
    for (let i = 0; i < 60; i++) {
      if (await evaluate("!!document.querySelector('#nk-sizes')")) break;
      await sleep(100);
    }
    await sleep(150);
  };
  /* Chrome keeps writing to its profile for a moment after the kill signal,
     so wait for it to leave before sweeping the directory away. */
  const close = async () => {
    try { ws.close(); } catch (e) { /* already gone */ }
    const gone = new Promise((resolve) => { chrome.once("exit", resolve); setTimeout(resolve, 3000); });
    chrome.kill();
    await gone;
    try { rmSync(profile, { recursive: true, force: true }); } catch (e) { /* a temp dir; the OS will get it */ }
  };
  return { go, eval: evaluate, errors, close };
}

const PROVERBS = [...en.proverbs.knit, ...en.proverbs.crochet, ...es.proverbs.knit, ...es.proverbs.crochet];
const normalise = (text) => PROVERBS.reduce((s, p) => s.split(p).join("<proverb>"), text);

async function main() {
  const server = await serveDist();
  let page;
  const transcript = [];
  try {
    page = await openChrome();
    const runs = [...SCENARIOS.map((s) => ({ name: s.name, run: async (p) => { await p.go(BASE + "?lang=en"); return p.eval(`(async () => {${PRELUDE}${s.js}\n})()`); } })), { name: "load paths and the notebook", run: loadPaths }];
    for (const { name, run } of runs) {
      await page.go(BASE + "?lang=en");
      await page.eval("localStorage.clear(); true");
      const before = page.errors.length;
      let result;
      try {
        result = await run(page);
      } catch (e) {
        result = { FAILED: String(e.message || e) };
      }
      const errs = page.errors.slice(before);
      transcript.push(`=== ${name} ===\n${normalise(JSON.stringify(result, null, 1))}\nerrors: ${errs.length ? "\n" + errs.join("\n") : "none"}\n`);
      process.stdout.write(`${errs.length || result.FAILED ? "✗" : "✓"} ${name}\n`);
    }
  } finally {
    if (page) await page.close();
    server.kill();
  }

  const actual = transcript.join("\n");
  const broken = /"FAILED":|^errors: \n/m.test(actual);
  if (update) {
    writeFileSync(GOLDEN, actual);
    console.log(`golden written: ${path.relative(ROOT, GOLDEN)}`);
    process.exit(broken ? 1 : 0);
  }
  if (!existsSync(GOLDEN)) {
    writeFileSync(LAST, actual);
    console.error("no golden transcript yet — inspect scripts/smoke.last.txt, then run `npm run smoke:update`");
    process.exit(1);
  }
  const golden = readFileSync(GOLDEN, "utf8");
  if (actual === golden && !broken) {
    console.log("smoke: identical to the golden transcript");
    process.exit(0);
  }
  writeFileSync(LAST, actual);
  console.error(broken ? "smoke: a scenario failed or the page logged an error" : "smoke: the transcript differs from the golden");
  const diff = spawnSync("diff", ["-u", GOLDEN, LAST], { encoding: "utf8" });
  console.error(diff.stdout || diff.stderr || "(diff unavailable — compare scripts/smoke.last.txt with scripts/smoke.golden.txt)");
  process.exit(1);
}

main().catch((e) => {
  console.error("smoke could not run:", e.message || e);
  process.exit(2);
});
