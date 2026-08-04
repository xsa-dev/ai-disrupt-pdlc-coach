import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import { setTimeout as sleep } from "node:timers/promises";
import WebSocket from "ws";

const port = 9229;
const profile = `/tmp/methodologies-cdp-${process.pid}`;
const chrome = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--disable-gpu", "--no-sandbox",
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"
], { stdio: "ignore" });
const getJson = path => new Promise((resolve, reject) => {
  http.get(`http://127.0.0.1:${port}${path}`, response => {
    let body = "";
    response.on("data", chunk => { body += chunk; });
    response.on("end", () => resolve(JSON.parse(body)));
  }).on("error", reject);
});
let ws;
try {
  let tabs;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try { tabs = await getJson("/json/list"); break; } catch { await sleep(100); }
  }
  const tab = tabs.find(item => item.type === "page") || tabs[0];
  if (!tab?.webSocketDebuggerUrl) throw new Error("Chrome CDP did not expose a page tab");
  ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.once("open", resolve); ws.once("error", reject); });
  let nextId = 0;
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const onMessage = raw => {
      const message = JSON.parse(raw.toString());
      if (message.id !== id) return;
      ws.off("message", onMessage);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    };
    ws.on("message", onMessage);
    ws.send(JSON.stringify({ id, method, params }));
  });
  await command("Emulation.setDeviceMetricsOverride", { width: 744, height: 1133, deviceScaleFactor: 1, mobile: false });
  await command("Page.navigate", { url: "http://127.0.0.1:8080/methodologies.html" });
  let cardsReady = false;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await sleep(100);
    const ready = await command("Runtime.evaluate", { expression: "document.querySelectorAll('#methodology-catalog article').length", returnByValue: true });
    if (ready.result?.value === 12) { cardsReady = true; break; }
  }
  if (!cardsReady) {
    const diagnostics = await command("Runtime.evaluate", { expression: "({href: location.href, title: document.title, body: document.body?.innerText?.slice(0, 120), cards: document.querySelectorAll('#methodology-catalog article').length})", returnByValue: true });
    throw new Error(`CDP page did not render 12 cards before timeout: ${JSON.stringify(diagnostics)}`);
  }
  const result = await command("Runtime.evaluate", { expression: `(() => {
    const details = document.querySelectorAll('#methodology-catalog details');
    const first = details[0];
    const initiallyClosed = details.length > 0 && first.open === false;
    first.querySelector('summary').click();
    return {
      cards: document.querySelectorAll('#methodology-catalog article').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      detailsInitiallyClosed: initiallyClosed,
      detailsOpenAfterClick: first.open,
      discoveryButton: document.querySelector('[data-stage="Discovery"]').getAttribute('aria-pressed')
    };
  })()` , returnByValue: true });
  const value = result.result.value;
  if (!value) throw new Error(`CDP evaluation failed: ${JSON.stringify(result)}`);
  if (value.cards !== 12 || value.overflow !== 0 || !value.detailsInitiallyClosed || !value.detailsOpenAfterClick || value.discoveryButton !== "false") {
    throw new Error(`CDP QA failed: ${JSON.stringify(value)}`);
  }
  console.log(`CDP_VIEWPORT_PASS width=744 cards=${value.cards} overflow=${value.overflow} details_open=${value.detailsOpenAfterClick}`);
} finally {
  if (ws) ws.close();
  chrome.kill("SIGTERM");
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch {}
}
