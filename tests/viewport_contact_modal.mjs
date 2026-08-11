// Real-Chrome CDP acceptance test for contact-author modal: proves the modal is
// interactive when open (P0 fix) and that background content gets inert.
import { spawn, spawnSync } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, "../web");
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://localhost");
  let rel = decodeURIComponent(u.pathname.slice(1));
  if (!rel) rel = "antipatterns.html";
  const file = path.resolve(webRoot, rel);
  if (!file.startsWith(webRoot + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end("nf"); return; }
  res.writeHead(200, { "content-type": mime[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

function chromePath() {
  for (const n of ["google-chrome", "chromium", "chromium-browser"]) {
    const f = spawnSync("bash", ["-lc", `command -v ${n}`], { encoding: "utf8" }).stdout.trim();
    if (f) return f;
  }
  throw new Error("Chrome not found");
}
const debugPort = 19222 + Math.floor(Math.random() * 500);
const chrome = spawn(chromePath(), [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  `--remote-debugging-port=${debugPort}`, `--user-data-dir=/tmp/ai-disrupt-contact-cdp-${process.pid}`,
  "about:blank"
], { stdio: "ignore" });

let ws, failed = 0;
const checks = [];
const check = (n, c) => { checks.push([n, !!c]); if (!c) failed++; console.log((c ? "PASS" : "FAIL") + "  " + n); };

try {
  let endpoint;
  for (let i = 0; i < 50; i++) {
    try { const tabs = await fetch(`http://127.0.0.1:${debugPort}/json`).then(r => r.json()); endpoint = tabs.find(t => t.type === "page")?.webSocketDebuggerUrl; if (endpoint) break; } catch {}
    await sleep(100);
  }
  if (!endpoint) throw new Error("Chrome CDP endpoint unavailable");
  ws = new WebSocket(endpoint);
  await new Promise((res, rej) => { ws.once("open", res); ws.once("error", rej); });
  let id = 0; const pending = new Map();
  ws.on("message", raw => {
    const m = JSON.parse(raw);
    if (m.id && pending.has(m.id)) { const { resolve, reject } = pending.get(m.id); pending.delete(m.id); if (m.error) reject(new Error(m.error.message)); else resolve(m.result); }
  });
  const send = (method, params = {}) => new Promise((res, rej) => { const c = ++id; pending.set(c, { resolve: res, reject: rej }); ws.send(JSON.stringify({ id: c, method, params })); });
  const evalJs = async expr => { const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text); return r.result.value; };
  await send("Page.enable"); await send("Runtime.enable");

  // antipatterns.html has NO <main> -> the P0 scenario
  await send("Page.navigate", { url: `http://127.0.0.1:${port}/antipatterns.html` });
  for (let i = 0; i < 60; i++) { await sleep(50); if (await evalJs("document.readyState") === "complete") break; }
  await sleep(200);

  check("FAB present", await evalJs("!!document.querySelector('.contact-fab')"));
  await evalJs("document.querySelector('.contact-fab').click()");
  await sleep(150);
  check("modal open", await evalJs("document.querySelector('.contact-overlay').classList.contains('open')"));
  // P0: modal + its input must NOT be inert when open (even without <main>)
  check("overlay not inert when open", await evalJs("!document.querySelector('.contact-overlay').hasAttribute('inert')"));
  check("input not inert when open", await evalJs("!document.getElementById('contact-msg').hasAttribute('inert')"));
  check("input focusable & typeable (P0 core)", await evalJs(`(()=>{const i=document.getElementById('contact-msg');i.focus();const ok=document.activeElement===i;i.value='x';return ok && i.value==='x';})()`));
  // background content (first body child that is not the modal) should be inert
  check("background content inert when open", await evalJs(`(()=>{const kids=[...document.body.children];const bg=kids.find(c=>!c.classList.contains('contact-overlay')&&!c.classList.contains('contact-fab'));return bg?bg.hasAttribute('inert'):false;})()`));
  // close -> inert removed
  await evalJs("document.querySelector('.contact-close').click()");
  await sleep(150);
  check("inert removed after close", await evalJs(`[...document.body.children].every(c=>!c.hasAttribute('inert'))`));
  console.log(`\n${checks.length - failed}/${checks.length} passed`);
} finally {
  if (ws) ws.close();
  chrome.kill("SIGTERM");
  await new Promise(r => server.close(r));
}
process.exit(failed ? 1 : 0);
