import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import { setTimeout as sleep } from "node:timers/promises";
import WebSocket from "ws";

const pages = {
  "diagnosis.html": "Диагностика",
  "roadmap.html": "Roadmap",
  "methodologies.html": "Методики",
  "antipatterns.html": "Антипаттерны",
  "openspec.html": "OpenSpec",
  "course-openspec.html": "Курс",
};
const widths = [390, 744];
const port = 9231;
const profile = `/tmp/header-cdp-${process.pid}`;
const chrome = spawn("/usr/bin/google-chrome", [
  "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank",
], { stdio: "ignore" });

const getJson = path => new Promise((resolve, reject) => {
  http.get(`http://127.0.0.1:${port}${path}`, response => {
    let body = "";
    response.on("data", chunk => { body += chunk; });
    response.on("end", () => resolve(JSON.parse(body)));
  }).on("error", reject);
});
const rounded = value => Math.round(value * 10) / 10;
let ws;

try {
  let tabs;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { tabs = await getJson("/json/list"); break; } catch { await sleep(100); }
  }
  const tab = tabs?.find(item => item.type === "page") || tabs?.[0];
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

  for (const width of widths) {
    const measurements = [];
    await command("Emulation.setDeviceMetricsOverride", {
      width, height: width === 390 ? 844 : 1133, deviceScaleFactor: 1, mobile: false,
    });

    for (const [page, expectedActive] of Object.entries(pages)) {
      await command("Page.navigate", { url: `http://127.0.0.1:8080/${page}` });
      let ready = false;
      for (let attempt = 0; attempt < 50; attempt += 1) {
        await sleep(100);
        const probe = await command("Runtime.evaluate", {
          expression: "document.readyState === 'complete' && !!document.querySelector('[data-site-header]')",
          returnByValue: true,
        });
        if (probe.result?.value) { ready = true; break; }
      }
      if (!ready) throw new Error(`${page}: header did not become ready`);

      const result = await command("Runtime.evaluate", { expression: `(() => {
        const rect = selector => {
          const r = document.querySelector(selector).getBoundingClientRect();
          return {x:r.x, y:r.y, width:r.width, height:r.height};
        };
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          nav: rect('.site-nav-row'),
          brand: rect('.site-brand-row'),
          title: rect('[data-site-title]'),
          active: document.querySelector('nav [aria-current="page"]')?.textContent.trim(),
          navLinks: [...document.querySelectorAll('nav a')].map(a => a.textContent.trim()),
          firstLinkLeft: document.querySelector('nav a:first-child').getBoundingClientRect().left,
          lastLinkRight: document.querySelector('nav a:last-child').getBoundingClientRect().right,
          navOverflowX: getComputedStyle(document.querySelector('.site-nav-row')).overflowX,
          viewportWidth: document.documentElement.clientWidth,
          headerHeight: document.querySelector('[data-site-header]').getBoundingClientRect().height,
        };
      })()`, returnByValue: true });
      const value = result.result?.value;
      if (!value) throw new Error(`${page}: no CDP measurement`);
      if (value.overflow !== 0) throw new Error(`${page}@${width}: overflow=${value.overflow}`);
      if (value.active !== expectedActive) throw new Error(`${page}@${width}: active=${value.active}`);
      if (value.navLinks.join("|") !== "Диагностика|Roadmap|Методики|Антипаттерны|OpenSpec|Курс") {
        throw new Error(`${page}@${width}: bad nav order`);
      }
      // Page itself must not scroll horizontally (overflow === 0 guard above).
      // On narrow viewports a 6-link nav may exceed width; that is acceptable ONLY if the
      // nav row scrolls internally (overflow-x: auto/scroll) instead of clipping silently.
      const navScrolls = /^(auto|scroll)$/i.test(value.navOverflowX || "");
      if (value.lastLinkRight > value.viewportWidth + 0.5 && !navScrolls) {
        throw new Error(`${page}@${width}: nav links clipped (${value.firstLinkLeft}..${value.lastLinkRight} of ${value.viewportWidth}) and nav not scrollable`);
      }
      measurements.push({ page, ...value });
    }

    const baseline = measurements[0];
    for (const item of measurements.slice(1)) {
      for (const key of ["x", "y", "width", "height"]) {
        if (Math.abs(item.nav[key] - baseline.nav[key]) > 0.5) throw new Error(`${item.page}@${width}: nav.${key} drift ${item.nav[key]} vs ${baseline.nav[key]}`);
        if (Math.abs(item.brand[key] - baseline.brand[key]) > 0.5) throw new Error(`${item.page}@${width}: brand.${key} drift ${item.brand[key]} vs ${baseline.brand[key]}`);
      }
      if (Math.abs(item.title.x - baseline.title.x) > 0.5 || Math.abs(item.title.y - baseline.title.y) > 0.5) {
        throw new Error(`${item.page}@${width}: title position drift`);
      }
      if (Math.abs(item.headerHeight - baseline.headerHeight) > 0.5) throw new Error(`${item.page}@${width}: header height drift`);
    }
    console.log(`HEADER_VIEWPORT_PASS width=${width} pages=4 overflow=0 nav=${rounded(baseline.nav.width)}x${rounded(baseline.nav.height)} brand=${rounded(baseline.brand.width)}x${rounded(baseline.brand.height)} header=${rounded(baseline.headerHeight)}`);
  }
} finally {
  if (ws) ws.close();
  chrome.kill("SIGTERM");
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch {}
}
