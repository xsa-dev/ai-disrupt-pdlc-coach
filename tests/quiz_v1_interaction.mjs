import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const html=fs.readFileSync(path.join(root,"web/antipatterns.html"),"utf8");
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://test.invalid/antipatterns.html?quiz=random&qv=1&seed=8K3M&strict=1#quiz-section",pretendToBeVisual:true});
const d=dom.window.document,assert=(x,m)=>{if(!x)throw new Error(m)};
assert(dom.window.localStorage.getItem("aipdlc.quiz.progress.v2")===null,"challenge setup/start must not write progress");
d.querySelector("#quiz-start").click();
assert(!d.querySelector("#quiz-run").classList.contains("hidden"),"start must enter run state");
assert(d.querySelector("#quiz-progress").textContent==="Вопрос 1 из 10","progress total must be accurate");
const restartKey=new dom.window.KeyboardEvent("keydown",{key:"R",bubbles:true,cancelable:true});
d.dispatchEvent(restartKey);
assert(restartKey.defaultPrevented,"R must restart the active challenge even before an answer");
let options=[...d.querySelectorAll("#quiz-options .quiz-opt")];
const correct=dom.window.__QUIZ_V1__.generateChallenge({mode:"random",seed:"8K3M",strict:true})[0].correct;
const wrong=options.find(b=>b.textContent!==correct),right=options.find(b=>b.textContent===correct);
wrong.click();
assert(d.querySelector("#quiz-next").classList.contains("hidden"),"strict wrong answer must block next");
right.click();
assert(!d.querySelector("#quiz-next").classList.contains("hidden"),"strict correction must unlock next without skipping");
assert(d.querySelector("#quiz-progress").textContent==="Вопрос 1 из 10","correction must not skip question");
// Restart and answer every question correctly to exercise local completion persistence.
d.querySelector("#quiz-next").click();
for(let question=1;question<10;question++){
 const q=dom.window.__QUIZ_V1__.generateChallenge({mode:"random",seed:"8K3M",strict:true})[question];
 const btn=[...d.querySelectorAll("#quiz-options .quiz-opt")].find(b=>b.textContent===q.correct); assert(btn,`correct option missing at ${question}`); btn.click(); d.querySelector("#quiz-next").click();
}
assert(!d.querySelector("#quiz-result").classList.contains("hidden"),"completion must render result");
const saved=JSON.parse(dom.window.localStorage.getItem("aipdlc.quiz.progress.v2"));
assert(saved.done["qv1:random:8K3M:strict:1"],"completion must persist exact qv1 identity");
assert(d.querySelector("#quiz-share-result").textContent.trim(),"result share control must remain available");

const shared=new JSDOM(html,{runScripts:"dangerously",url:"https://test.invalid/antipatterns.html?quiz=fixed&qv=1&ticket=3&score=8&total=9#quiz-section",pretendToBeVisual:true});
const sd=shared.window.document;
sd.querySelector("#quiz-result-cta").click();
assert(!sd.querySelector("#quiz-setup").classList.contains("hidden")&&sd.querySelector("#quiz-run").classList.contains("hidden"),"shared result CTA must return to explicit setup, not start");
assert(!shared.window.location.search.includes("score=")&&!shared.window.location.search.includes("total="),"shared result CTA must strip aggregate result fields");
const shared2=new JSDOM(html,{runScripts:"dangerously",url:"https://test.invalid/antipatterns.html?quiz=fixed&qv=1&ticket=3&score=8&total=9#quiz-section",pretendToBeVisual:true});
const enter=new shared2.window.KeyboardEvent("keydown",{key:"Enter",bubbles:true,cancelable:true});
shared2.window.document.dispatchEvent(enter);
assert(enter.defaultPrevented&&!shared2.window.document.querySelector("#quiz-setup").classList.contains("hidden"),"Enter on shared result must activate setup CTA behavior");
assert(!shared2.window.location.search.includes("score="),"shared-result keyboard transition must strip result URL");
console.log("QUIZ_V1_INTERACTION_PASS strict=blocked completion=persisted keyboard=restart+shared-cta");
