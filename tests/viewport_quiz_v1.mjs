import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const here = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(here, "../web");
const prefix = "/ai-disrupt-pdlc-coach/";
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const u = new URL(req.url, "http://localhost");
  if (!u.pathname.startsWith(prefix)) { res.writeHead(404).end("not found"); return; }
  let rel = decodeURIComponent(u.pathname.slice(prefix.length));
  if (!rel) rel = "index.html";
  const file = path.resolve(webRoot, rel);
  if (!file.startsWith(webRoot + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404).end("not found"); return;
  }
  res.writeHead(200, { "content-type": mime[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;

function chromePath() {
  for (const name of ["google-chrome", "chromium", "chromium-browser"]) {
    const found = spawnSync("bash", ["-lc", `command -v ${name}`], {encoding:"utf8"}).stdout.trim();
    if (found) return found;
  }
  throw new Error("Chrome/Chromium not found");
}
const debugPort = 19222 + Math.floor(Math.random() * 500);
const chrome = spawn(chromePath(), [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
  `--remote-debugging-port=${debugPort}`, "--user-data-dir=/tmp/ai-disrupt-quiz-cdp",
  "about:blank"
], {stdio:"ignore"});

let ws;
try {
  let endpoint;
  for (let i=0; i<50; i++) {
    try {
      const tabs = await fetch(`http://127.0.0.1:${debugPort}/json` ).then(r=>r.json());
      endpoint = tabs.find(t=>t.type==="page")?.webSocketDebuggerUrl;
      if (endpoint) break;
    } catch {}
    await sleep(100);
  }
  if (!endpoint) throw new Error("Chrome CDP endpoint unavailable");
  ws = new WebSocket(endpoint);
  await new Promise((resolve,reject)=>{ws.once("open",resolve);ws.once("error",reject);});
  let id=0;
  const pending=new Map();
  const runtimeErrors=[];
  ws.on("message",raw=>{
    const msg=JSON.parse(raw);
    if (msg.id && pending.has(msg.id)) {
      const {resolve,reject}=pending.get(msg.id); pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
    }
    if (msg.method==="Runtime.exceptionThrown") runtimeErrors.push(msg.params.exceptionDetails.text);
    if (msg.method==="Log.entryAdded" && ["error","warning"].includes(msg.params.entry.level)) runtimeErrors.push(msg.params.entry.text);
  });
  const send=(method,params={})=>new Promise((resolve,reject)=>{
    const call=++id; pending.set(call,{resolve,reject}); ws.send(JSON.stringify({id:call,method,params}));
  });
  const evalJs=async expression => {
    const r=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
    return r.result.value;
  };
  const navigate=async route => {
    await send("Page.navigate",{url:`http://127.0.0.1:${port}${prefix}${route}`});
    for (let i=0;i<60;i++) {
      await sleep(50);
      const ready=await evalJs("document.readyState");
      if (ready==="complete") break;
    }
    await sleep(100);
  };
  await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable");

  const viewports=[[390,844],[744,1133],[1440,900]];
  for (const [width,height] of viewports) {
    await send("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:width<600});
    await navigate("antipatterns.html?quiz=random&seed=8K3M&strict=0&qv=1#quiz-section");
    const state=await evalJs(`(()=>({
      href:location.pathname+location.search+location.hash,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      setup:!document.getElementById('quiz-setup').classList.contains('hidden'),
      seed:document.getElementById('quiz-seed').value,
      run:!document.getElementById('quiz-run').classList.contains('hidden')
    }))()`);
    if (state.overflow!==0 || !state.setup || state.run || state.seed!=="8K3M") throw new Error(`random viewport ${width} invalid: ${JSON.stringify(state)}`);
    if (state.href!==`${prefix}antipatterns.html?quiz=random&qv=1&seed=8K3M#quiz-section`) throw new Error(`random canonical URL mismatch: ${state.href}`);
  }

  await navigate("antipatterns.html?quiz=setup&qv=1#quiz-section");
  let state=await evalJs(`(()=>({setup:!document.getElementById('quiz-setup').classList.contains('hidden'),href:location.pathname+location.search+location.hash}))()`);
  if (!state.setup || state.href!==`${prefix}antipatterns.html?quiz=setup&qv=1#quiz-section`) throw new Error("setup deeplink mismatch");

  await navigate("antipatterns.html?quiz=fixed&ticket=3&strict=1&qv=1#quiz-section");
  state=await evalJs(`(()=>({ticket:document.getElementById('ticket-select').value,strict:document.getElementById('quiz-strict').checked,run:!document.getElementById('quiz-run').classList.contains('hidden'),href:location.pathname+location.search+location.hash}))()`);
  if (state.ticket!=="3" || !state.strict || state.run || state.href!==`${prefix}antipatterns.html?quiz=fixed&qv=1&ticket=3&strict=1#quiz-section`) throw new Error(`fixed deeplink mismatch ${JSON.stringify(state)}`);

  await navigate("antipatterns.html?quiz=random&seed=8K3M&strict=0&qv=1&score=8&total=10#quiz-section");
  state=await evalJs(`(()=>({result:!document.getElementById('quiz-result').classList.contains('hidden'),score:document.getElementById('quiz-score').textContent,disclosure:!document.getElementById('quiz-result-disclosure').classList.contains('hidden'),cta:document.getElementById('quiz-result-cta').getAttribute('href')}))()`);
  if (!state.result || state.score!=="8 из 10" || !state.disclosure || /score=|total=/.test(state.cta)) throw new Error(`result deeplink mismatch ${JSON.stringify(state)}`);

  await navigate("antipatterns.html");
  await evalJs(`localStorage.setItem('aipdlc.quiz.progress.v2','sentinel-bytes')`);
  const invalidRoute="antipatterns.html?quiz=random&seed=8K3M&qv=1#QUIZ-SECTION";
  await navigate(invalidRoute);
  state=await evalJs(`(()=>({href:location.pathname+location.search+location.hash,raw:localStorage.getItem('aipdlc.quiz.progress.v2'),error:document.getElementById('quiz-link-error').textContent,run:!document.getElementById('quiz-run').classList.contains('hidden')}))()`);
  if (state.href!==`${prefix}${invalidRoute}` || state.raw!=="sentinel-bytes" || !state.error || state.run) throw new Error(`invalid-link invariant failed ${JSON.stringify(state)}`);
  if (runtimeErrors.length) throw new Error(`browser console/runtime errors: ${runtimeErrors.join(" | ")}`);
  console.log("QUIZ_CHROME_ACCEPTANCE_PASS routes=5 viewports=390,744,1440 overflow=0 invalid-storage=unchanged");
} finally {
  if (ws) ws.close();
  chrome.kill("SIGTERM");
  await new Promise(resolve=>server.close(resolve));
}
