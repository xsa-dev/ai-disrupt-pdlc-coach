import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import WebSocket from "ws";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../web");
const prefix = "/ai-disrupt-pdlc-coach/";
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, "http://127.0.0.1").pathname;
  if (!pathname.startsWith(prefix)) {
    response.writeHead(404).end("not found");
    return;
  }
  const relative = pathname.slice(prefix.length) || "index.html";
  const file = path.resolve(root, relative);
  if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file)) {
    response.writeHead(404).end("not found");
    return;
  }
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  fs.createReadStream(file).pipe(response);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const sitePort = server.address().port;
const cdpPort = 9300 + (process.pid % 500);
const profile = `/tmp/index-cdp-${process.pid}`;
const chrome = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--disable-gpu", "--no-sandbox",
  `--remote-debugging-port=${cdpPort}`, `--user-data-dir=${profile}`, "about:blank",
], { stdio: "ignore" });

const getJson = endpoint => new Promise((resolve, reject) => {
  http.get(`http://127.0.0.1:${cdpPort}${endpoint}`, response => {
    let body = "";
    response.on("data", chunk => { body += chunk; });
    response.on("end", () => resolve(JSON.parse(body)));
  }).on("error", reject);
});
let ws;
try {
  let tabs;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try { tabs = await getJson("/json/list"); break; } catch { await sleep(100); }
  }
  const tab = tabs?.find(item => item.type === "page") || tabs?.[0];
  if (!tab?.webSocketDebuggerUrl) throw new Error("Chrome CDP did not expose a page");
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
  const start = `http://127.0.0.1:${sitePort}${prefix}?quiz=random#quiz-section`;
  await command("Page.navigate", { url: start });
  let finalUrl = "";
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await sleep(100);
    const result = await command("Runtime.evaluate", {
      expression: "document.readyState === 'complete' ? location.href : ''",
      returnByValue: true,
    });
    finalUrl = result.result?.value || "";
    if (finalUrl.endsWith(`${prefix}diagnosis.html`)) break;
  }
  const expected = `http://127.0.0.1:${sitePort}${prefix}diagnosis.html`;
  if (finalUrl !== expected) throw new Error(`redirect mismatch: ${finalUrl} != ${expected}`);
  console.log(`INDEX_REDIRECT_PASS final=${finalUrl}`);
} finally {
  if (ws) ws.close();
  chrome.kill("SIGTERM");
  server.close();
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
}
