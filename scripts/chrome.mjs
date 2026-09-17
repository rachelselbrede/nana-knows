/* The headless Chrome both scripts drive.
   ---------------------------------------------------------------------------
   The smoke run reads the built page and the shots script photographs it, and
   they need exactly the same things to do it: `vite preview` over dist/, a
   Chrome with a throwaway profile, and a DevTools connection that can
   navigate, evaluate, and notice when the page logs an error. That lived
   inside smoke.mjs until there was a second script that wanted it.

   No dependencies: Node's own fetch and WebSocket, the DevTools protocol, and
   whichever Chrome is installed (CHROME_PATH overrides the search). */

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* The site is built with base "/nana-knows/", and the preview serves it there. */
export const baseUrl = (port) => `http://127.0.0.1:${port}/nana-knows/`;

const CHROME =
  process.env.CHROME_PATH ||
  [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ].find(existsSync);

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function serveDist(port) {
  if (!existsSync(path.join(ROOT, "dist", "index.html"))) {
    throw new Error("dist/ is missing — run `npm run build` first");
  }
  const vite = path.join(ROOT, "node_modules", "vite", "bin", "vite.js");
  const server = spawn(
    process.execPath,
    [vite, "preview", "--port", String(port), "--strictPort", "--host", "127.0.0.1"],
    { cwd: ROOT, stdio: "ignore" },
  );
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(baseUrl(port))).ok) return server;
    } catch (e) {
      /* not up yet */
    }
    await sleep(250);
  }
  server.kill();
  throw new Error("the preview server never answered");
}

export async function openChrome({ width = 900, height = 1400 } = {}) {
  if (!CHROME) throw new Error("no Chrome found; set CHROME_PATH");
  const profile = mkdtempSync(path.join(tmpdir(), "nana-chrome-"));
  const port = 9377;
  const flags = [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${port}`,
    `--window-size=${width},${height}`,
    `--user-data-dir=${profile}`,
  ];
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
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
      errors.push(
        "console.error: " +
          m.params.args
            .map((a) => a.value ?? a.description ?? "")
            .join(" ")
            .slice(0, 200),
      );
    }
    if (m.method === "Runtime.exceptionThrown") {
      errors.push(
        "exception: " +
          (
            m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text
          ).slice(0, 200),
      );
    }
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res) => {
      const i = ++id;
      pending.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  await send("Runtime.enable");
  await send("Page.enable");

  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.result?.exceptionDetails) {
      throw new Error(
        "in the page: " +
          (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text),
      );
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
    try {
      ws.close();
    } catch (e) {
      /* already gone */
    }
    const gone = new Promise((resolve) => {
      chrome.once("exit", resolve);
      setTimeout(resolve, 3000);
    });
    chrome.kill();
    await gone;
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch (e) {
      /* a temp dir; the OS will get it */
    }
  };
  return { go, eval: evaluate, send, errors, close };
}
