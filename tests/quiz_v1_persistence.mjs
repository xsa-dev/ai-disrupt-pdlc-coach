import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const source=fs.readFileSync(path.join(root,"web/antipatterns.html"),"utf8");
const html=source;
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://test.invalid/antipatterns.html"});
const api=dom.window.__QUIZ_V1__, storage=dom.window.localStorage;
const assert=(x,m)=>{if(!x)throw new Error(m)};
assert(!source.includes(".localeCompare("),"retention tie-break must use fixed code-unit identity ordering, not locale collation");
const V2="aipdlc.quiz.progress.v2",V1="aipdlc.quiz.progress.v1";
const memoryStorage=initial=>{
 let value=initial;
 return {getItem:k=>k===V2?value:null,setItem(k,v){if(k===V2)value=v;},value:()=>value};
};
storage.setItem(V1,"legacy-bytes");
let store=api.createProgressStore(storage);
assert(store.valid && Object.keys(store.data.done).length===0,"missing v2 must load empty valid store");
let r=store.record("qv1:fixed:3:strict:0",8,9,1000);
assert(r.pct===89 && storage.getItem(V1)==="legacy-bytes","record must calculate pct and preserve v1");
store.record("qv1:fixed:3:strict:0",7,9,900);
let saved=JSON.parse(storage.getItem(V2)).done["qv1:fixed:3:strict:0"];
assert(saved.score===8 && saved.bestAt===1000 && saved.lastAttemptAt===1000,"lower result/time must retain best and monotonic time");
store.record("qv1:fixed:3:strict:0",9,9,1200);
saved=JSON.parse(storage.getItem(V2)).done["qv1:fixed:3:strict:0"];
assert(saved.score===9 && saved.pct===100 && saved.bestAt===1200 && saved.lastAttemptAt===1200,"strict improvement must replace best");
store.record("qv1:fixed:3:strict:1",8,9,1300);
assert(store.fixedExcellentCount()===1,"strict variants must count fixed ticket once");
const malformed='{"schema":2,"done":{"qv1:random:ABCD:strict:0":{"score":5,"total":10,"pct":51,"bestAt":1,"lastAttemptAt":1}}}';
storage.setItem(V2,malformed); store=api.createProgressStore(storage);
assert(!store.valid && Object.keys(store.data.done).length===0,"one malformed entry must quarantine whole store");
store.record("qv1:random:EFGH:strict:0",8,10,2);
assert(storage.getItem(V2)===malformed,"quarantine must preserve raw and disable writes");
store.reset(); assert(store.valid && storage.getItem(V2)==='{"schema":2,"done":{}}',"explicit reset must replace malformed bytes");
const malformedStores=[
 '{}',
 '{"schema":1,"done":{}}',
 '{"schema":2,"done":[],"extra":0}',
 '{"schema":2,"done":{"qv1:random:ABCD:strict:0":{"score":5,"total":10,"pct":50,"bestAt":1}}}',
 '{"schema":2,"done":{"qv1:random:ABCD:strict:0":{"score":5,"total":10,"pct":50,"bestAt":1,"lastAttemptAt":1,"extra":0}}}',
 '{"schema":2,"done":{"qv1:random:abcd:strict:0":{"score":5,"total":10,"pct":50,"bestAt":1,"lastAttemptAt":1}}}',
 '{"schema":2,"done":{"qv1:random:ABCD:strict:2":{"score":5,"total":10,"pct":50,"bestAt":1,"lastAttemptAt":1}}}',
 '{"schema":2,"done":{"qv1:fixed:3:strict:0":{"score":5,"total":10,"pct":50,"bestAt":1,"lastAttemptAt":1}}}',
 '{"schema":2,"done":{"qv1:fixed:3:strict:0":{"score":10,"total":9,"pct":111,"bestAt":1,"lastAttemptAt":1}}}',
 '{"schema":2,"done":{"qv1:fixed:3:strict:0":{"score":8,"total":9,"pct":88,"bestAt":1,"lastAttemptAt":1}}}',
 '{"schema":2,"done":{"qv1:fixed:3:strict:0":{"score":8.5,"total":9,"pct":94,"bestAt":1,"lastAttemptAt":1}}}',
 '{"schema":2,"done":{"qv1:fixed:3:strict:0":{"score":"8","total":9,"pct":89,"bestAt":1,"lastAttemptAt":1}}}',
 '{"schema":2,"done":{"qv1:fixed:3:strict:0":{"score":8,"total":9,"pct":89,"bestAt":2,"lastAttemptAt":1}}}'
];
for(const raw of malformedStores){
 const mem=memoryStorage(raw), quarantined=api.createProgressStore(mem);
 assert(!quarantined.valid && mem.value()===raw,`malformed store must be quarantined byte-for-byte: ${raw}`);
 quarantined.record("qv1:fixed:1:strict:0",8,9,10);
 assert(mem.value()===raw,"quarantined store must disable automatic writes");
}
for(let i=0;i<102;i++){
 const seed=i.toString(36).toUpperCase().padStart(4,"0");
 store.record(`qv1:random:${seed}:strict:0`,8,10,i);
}
store.record("qv1:fixed:1:strict:0",8,9,0);
const done=JSON.parse(storage.getItem(V2)).done;
assert(Object.keys(done).filter(k=>k.includes(":random:")).length===100,"random retention must cap at 100");
assert(done["qv1:fixed:1:strict:0"],"fixed record must never be evicted");
assert(!done["qv1:random:0000:strict:0"]&&!done["qv1:random:0001:strict:0"],"oldest random identities must be evicted");
store.reset();
for(let i=0;i<101;i++) store.record(`qv1:random:${i.toString(36).toUpperCase().padStart(4,"0")}:strict:0`,8,10,5000);
const tied=JSON.parse(storage.getItem(V2)).done;
assert(Object.keys(tied).filter(k=>k.includes(":random:")).length===100,"tied retention must keep exactly 100 random records");
assert(!tied["qv1:random:0000:strict:0"] && tied["qv1:random:0001:strict:0"],"identity must deterministically break tied timestamps");
const unavailable={getItem(){return null;},setItem(){throw new Error("quota");}};
const failedWrite=api.createProgressStore(unavailable).record("qv1:fixed:1:strict:0",8,9,2000);
assert(failedWrite.saved===false,"storage write failure must never claim saved:true");
console.log(`QUIZ_V1_PERSISTENCE_PASS malformed=${malformedStores.length+1} retention=100 tied=deterministic legacy=untouched write-failure=honest`);
