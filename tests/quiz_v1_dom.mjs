import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const source=fs.readFileSync(path.join(root,"web/antipatterns.html"),"utf8");
const injected=source.replace("<script>\n    // ============ DATA",`<script>localStorage.setItem("sentinel","unchanged");localStorage.setItem("aipdlc.quiz.progress.v1","legacy");</script>\n    <script>\n    // ============ DATA`);
const load=url=>new JSDOM(injected,{runScripts:"dangerously",url,pretendToBeVisual:true});
const assert=(x,m)=>{if(!x)throw new Error(m)};
let dom=load("https://host.test/repo/antipatterns.html?total=9&score=8&ticket=3&qv=1&quiz=fixed#quiz-section");
let d=dom.window.document;
assert(!d.querySelector("#quiz-result").classList.contains("hidden"),"valid result link must render result card");
assert(d.querySelector("#quiz-score").textContent.includes("8 из 9"),"result aggregate must render");
const disclosure="Неподтверждённый результат: данные взяты из ссылки, могут быть изменены отправителем и не проверялись сервером.";
assert(d.querySelector("#quiz-result-disclosure").textContent.trim()===disclosure,"exact disclosure missing");
assert(d.querySelector("#quiz-result").getAttribute("aria-describedby")==="quiz-result-disclosure","result disclosure must be associated");
const cta=d.querySelector("#quiz-result-cta").getAttribute("href");
assert(cta.includes("quiz=fixed")&&cta.includes("ticket=3")&&!cta.includes("score=")&&!cta.includes("total="),"CTA must preserve challenge and strip result");
assert(dom.window.localStorage.getItem("sentinel")==="unchanged"&&dom.window.localStorage.getItem("aipdlc.quiz.progress.v1")==="legacy"&&dom.window.localStorage.getItem("aipdlc.quiz.progress.v2")===null,"result viewing must not mutate storage");
dom=load("https://host.test/repo/antipatterns.html?strict=0&seed=8k3m&qv=1&quiz=random");
assert(dom.window.location.href==="https://host.test/repo/antipatterns.html?quiz=random&qv=1&seed=8K3M#quiz-section","noncanonical valid URL must replaceState");
assert(dom.window.localStorage.length===2,"canonicalization must not mutate storage");
dom=load("https://host.test/repo/antipatterns.html?quiz=random&qv=1&seed=BAD#WRONG"); d=dom.window.document;
assert(dom.window.location.hash==="#WRONG","invalid URL must be retained");
assert(!d.querySelector("#quiz-link-error").classList.contains("hidden"),"invalid URL must show setup error");
assert(d.querySelector("#quiz-run").classList.contains("hidden"),"invalid URL must not autostart");
dom=load("https://host.test/repo/antipatterns.html?qv=1#quiz-section"); d=dom.window.document;
assert(!d.querySelector("#quiz-link-error").classList.contains("hidden"),"allowlisted fields without quiz must show a safe setup error");
assert(d.querySelector("#quiz-run").classList.contains("hidden"),"missing quiz mode must not autostart");
assert(d.querySelector('label[for="ticket-select"]'),"ticket select must have an associated label");
assert(d.querySelector("#mode-random").getAttribute("aria-pressed")==="true"&&d.querySelector("#mode-fixed").getAttribute("aria-pressed")==="false","mode toggles must expose selected state");
for(const id of ["quiz-share","quiz-share-result"]){const b=d.querySelector(`#${id}`);assert(b&&b.tagName==="BUTTON"&&b.textContent.trim(),`${id} accessible button missing`)}
assert(d.querySelector("#quiz-share-feedback").getAttribute("aria-live"),"share feedback must be aria-live");

// Random seed generation assertions
const randomBtn = d.querySelector("#mode-random");
const fixedBtn = d.querySelector("#mode-fixed");
const seedInput = d.querySelector("#quiz-seed");
const seedRefresh = d.querySelector("#quiz-seed-refresh");
const seedBtn = d.querySelector("#quiz-seed-btn");
assert(seedInput && seedRefresh && seedBtn, "seed controls must exist");

const seed1 = seedInput.value;
fixedBtn.click();
randomBtn.click();
const seed2 = seedInput.value;
assert(seed2 && /^[2-9A-Z]{4}$/.test(seed2), "clicking mode-random must generate valid 4-char uppercase seed");

seedRefresh.click();
const seed3 = seedInput.value;
assert(seed3 && /^[2-9A-Z]{4}$/.test(seed3), "clicking seed-refresh must generate valid 4-char uppercase seed");

seedBtn.click();
const seed4 = seedInput.value;
assert(seed4 && /^[2-9A-Z]{4}$/.test(seed4), "clicking seed-btn must generate valid 4-char uppercase seed");

console.log("QUIZ_V1_DOM_PASS result=readonly canonicalization=replace invalid=safe seed-random=ok");
