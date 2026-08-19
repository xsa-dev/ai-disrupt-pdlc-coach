import { spawn } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import WebSocket from "ws";
import { execSync } from "node:child_process";

const webRoot = path.resolve("/home/admin/ai-disrupt-pdlc-coach/web");
const mime = { ".html":"text/html; charset=utf-8", ".js":"text/javascript", ".css":"text/css" };
const server = http.createServer((req,res)=>{
  const u=new URL(req.url,"http://localhost"); let rel=decodeURIComponent(u.pathname.slice(1)); if(!rel) rel="index.html";
  const f=path.resolve(webRoot,rel);
  if(!f.startsWith(webRoot+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404).end("nf");return;}
  res.writeHead(200,{"content-type":mime[path.extname(f)]||"application/octet-stream"}); fs.createReadStream(f).pipe(res);
});
await new Promise(r=>server.listen(0,"127.0.0.1",r)); const port=server.address().port;
const bin = execSync("bash -lc 'command -v google-chrome || command -v chromium || command -v chromium-browser'").toString().trim();
const debugPort = 19771 + Math.floor(Math.random()*200);
const chrome = spawn(bin,["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage",`--remote-debugging-port=${debugPort}`,`--user-data-dir=/tmp/nl-cdp-${process.pid}`,"about:blank"],{stdio:"ignore"});
let ws, failed=0; const check=(n,c)=>{console.log((c?"PASS":"FAIL")+"  "+n); if(!c)failed++;};
try{
  let ep; for(let i=0;i<50;i++){try{const t=await fetch(`http://127.0.0.1:${debugPort}/json`).then(r=>r.json()); ep=t.find(x=>x.type==="page")?.webSocketDebuggerUrl; if(ep)break;}catch{} await sleep(100);}
  ws=new WebSocket(ep); await new Promise((res,rej)=>{ws.once("open",res);ws.once("error",rej);});
  const idmap=new Map(); let id=0;
  ws.on("message",raw=>{const m=JSON.parse(raw); if(m.id&&idmap.has(m.id)){const{resolve,reject}=idmap.get(m.id);idmap.delete(m.id); m.error?reject(new Error(m.error.message)):resolve(m.result);}});
  const send=(method,params={})=>new Promise((res,rej)=>{const c=++id;idmap.set(c,{resolve:res,reject:rej});ws.send(JSON.stringify({id:c,method,params}));});
  const ev=(expr)=>send("Runtime.evaluate",{expression:expr,returnByValue:true,awaitPromise:true}).then(r=>{if(r.exceptionDetails)throw new Error(r.exceptionDetails.text);return r.result.value;});
  await send("Page.enable"); await send("Runtime.enable");
  await send("Page.navigate",{url:`http://127.0.0.1:${port}/course-openspec.html`});
  for(let i=0;i<60;i++){await sleep(50); if(await ev("document.readyState")==="complete")break;}
  // wait for contact-modal.js (defer) to build the modal (checkbox appears)
  for(let i=0;i<60;i++){await sleep(100); if(await ev("document.getElementById('contact-newsletter') !== null"))break;}
  // 1. checkbox present in modal
  check("newsletter checkbox present", await ev("document.getElementById('contact-newsletter') !== null"));
  // 2. course-end CTA opens modal + pre-checks
  await ev("document.getElementById('course-newsletter-btn').click()");
  await sleep(200);
  const modalOpen = await ev("document.querySelector('.contact-overlay') ? document.querySelector('.contact-overlay').classList.contains('open') : false");
  check("CTA opens contact modal", modalOpen);
  const prechecked = await ev("document.getElementById('contact-newsletter').checked === true");
  check("CTA pre-checks newsletter", prechecked);
  // install fetch wrapper in page context (after load) to capture payload
  await ev("window.__cap=null; const _f=window.fetch.bind(window); window.fetch=function(u,o){ if(o&&o.body&&o.body.indexOf('newsletter')>=0){ window.__cap=o.body; } return _f(u,o); };");
  // 3. fill message + send -> payload has newsletter:yes
  await ev("document.getElementById('contact-msg').value = 'тест'");
  await ev("document.querySelector('.contact-send').click()");
  await sleep(500);
  const captured = await ev("window.__cap");
  check("payload includes newsletter:yes", captured && captured.includes('"newsletter":"yes"'));
  console.log("captured payload:", captured);
}catch(e){console.log("ERROR:",e.message);failed++;}finally{if(ws)ws.close();chrome.kill("SIGTERM");await new Promise(r=>server.close(r));}
process.exit(failed?1:0);
