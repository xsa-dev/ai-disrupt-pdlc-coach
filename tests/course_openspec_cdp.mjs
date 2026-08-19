// Real-Chrome CDP verification of the OpenSpec course page interactivity.
import { spawn, spawnSync } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, "../web");
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css" };
const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://localhost");
  let rel = decodeURIComponent(u.pathname.slice(1));
  if (!rel) rel = "course-openspec.html";
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
const debugPort = 19223 + Math.floor(Math.random() * 400);
const chrome = spawn(chromePath(), ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", `--remote-debugging-port=${debugPort}`, `--user-data-dir=/tmp/ai-disrupt-course-cdp-${process.pid}`, "about:blank"], { stdio: "ignore" });

let ws, failed = 0; const checks = [];
const check = (n, c) => { checks.push([n, !!c]); if (!c) failed++; console.log((c ? "PASS" : "FAIL") + "  " + n); };

try {
  let endpoint;
  for (let i = 0; i < 50; i++) { try { const t = await fetch(`http://127.0.0.1:${debugPort}/json`).then(r => r.json()); endpoint = t.find(x => x.type === "page")?.webSocketDebuggerUrl; if (endpoint) break; } catch {} await sleep(100); }
  if (!endpoint) throw new Error("CDP endpoint unavailable");
  ws = new WebSocket(endpoint);
  await new Promise((res, rej) => { ws.once("open", res); ws.once("error", rej); });
  let id = 0; const pending = new Map();
  ws.on("message", raw => { const m = JSON.parse(raw); if (m.id && pending.has(m.id)) { const { resolve, reject } = pending.get(m.id); pending.delete(m.id); if (m.error) reject(new Error(m.error.message)); else resolve(m.result); } });
  const send = (method, params = {}) => new Promise((res, rej) => { const c = ++id; pending.set(c, { resolve: res, reject: rej }); ws.send(JSON.stringify({ id: c, method, params })); });
  const evalJs = async expr => { const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text); return r.result.value; };
  await send("Page.enable"); await send("Runtime.enable");

  await send("Page.navigate", { url: `http://127.0.0.1:${port}/course-openspec.html` });
  for (let i = 0; i < 60; i++) { await sleep(50); if (await evalJs("document.readyState") === "complete") break; }
  await sleep(300);

  check("page + modules rendered", await evalJs("document.querySelectorAll('.module').length === 6"));
  check("styles.css loaded (tokens)", await evalJs("getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim().length > 0"));
  check("main.js loaded (quiz globals)", await evalJs("typeof window.selectOption === 'function' && typeof window.checkQuiz === 'function'"));

  // Quiz: select correct option, check, expect success feedback
  await evalJs("window.selectOption(document.querySelector('#quiz-module3 .quiz-option[data-value=\"option-b\"]'))");
  await evalJs("window.checkQuiz('quiz-module3')");
  await sleep(150);
  check("quiz shows success on correct", await evalJs("document.querySelector('#quiz-module3 .quiz-feedback').classList.contains('success')"));

  // Group chat: advance one step reveals a message
  const before = await evalJs("[...document.querySelectorAll('#chat-module4 .chat-message')].filter(m=>m.style.display!=='none').length");
  await evalJs("document.querySelector('#chat-module4 .chat-next-btn').click()");
  await sleep(1000);
  const after = await evalJs("[...document.querySelectorAll('#chat-module4 .chat-message')].filter(m=>m.style.display!=='none').length");
  check("chat advances on next", after > before);

  // Flow: next step highlights an actor + updates label
  await evalJs("document.querySelector('#chat-module4').closest('section').querySelector('.flow-next-btn').click()");
  await sleep(150);
  check("flow highlights an actor", await evalJs("document.querySelectorAll('#chat-module4').length>0 && document.querySelector('.flow-actor.active') !== null || document.querySelectorAll('.flow-animation .flow-actor.active').length>0"));

  // Glossary: term tooltip appears on click
  await evalJs("document.querySelector('.term').dispatchEvent(new MouseEvent('click',{bubbles:true}))");
  await sleep(200);
  check("glossary tooltip appears", await evalJs("document.querySelector('.term-tooltip') !== null"));

  // Spot-the-bug: click correct line -> success
  await evalJs("document.querySelector('.bug-target').click()");
  await sleep(150);
  check("spot-bug marks correct", await evalJs("document.querySelector('.bug-target').classList.contains('correct')"));

  console.log(`\n${checks.length - failed}/${checks.length} passed`);
} catch (e) {
  console.log("ERROR:", e.message);
  failed++;
} finally {
  if (ws) ws.close();
  chrome.kill("SIGTERM");
  await new Promise(r => server.close(r));
}
process.exit(failed ? 1 : 0);
