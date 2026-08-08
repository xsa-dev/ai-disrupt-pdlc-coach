import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const html=fs.readFileSync(path.join(root,"web/antipatterns.html"),"utf8");
const dom=new JSDOM(html,{runScripts:"dangerously",url:"https://host.test/repo/antipatterns.html"});
const api=dom.window.__QUIZ_V1__;
const assert=(x,m)=>{if(!x)throw new Error(m)};
const parse=s=>api.parseQuizUrl(new URL(s,"https://host.test/repo/antipatterns.html"),s);
let p=parse("antipatterns.html?strict=0&seed=8k3m&qv=1&quiz=random&junk=x");
assert(p.valid && p.config.seed==="8K3M" && !p.config.strict,"lowercase seed/default strict must normalize");
assert(p.route==="antipatterns.html?quiz=random&qv=1&seed=8K3M#quiz-section","canonical key order/fragment mismatch");
assert(api.serializeQuiz({mode:"fixed",ticket:3,strict:true})==="antipatterns.html?quiz=fixed&qv=1&ticket=3&strict=1#quiz-section","fixed serializer mismatch");
const valid=[
 "?quiz=setup&qv=1#quiz-section",
 "?quiz=setup&qv=1",
 "?quiz=setup&qv=1#",
 "?quiz=setup&qv=1&unknown=ignored#quiz-section",
 "?quiz=fixed&qv=1&ticket=7&score=8&total=8#quiz-section",
 "?quiz=fixed&qv=1&ticket=1&strict=0#quiz-section",
 "?quiz=random&qv=1&seed=ABCD&strict=1&autostart=1#quiz-section",
 "?quiz=random&qv=1&seed=abcd#",
];
for(const s of valid) assert(parse(s).valid,`expected valid: ${s}`);
const invalid=[
 "?quiz=random&qv=1&seed=ABCD&seed=EFGH#quiz-section",
 "?quiz=random&qv=1&qv=1&seed=ABCD#quiz-section",
 "?quiz=random&seed=ABCD#quiz-section",
 "?quiz=random&qv=&seed=ABCD#quiz-section",
 "?quiz=random&qv=2&seed=ABCD#quiz-section",
 "?quiz=random&qv=1&seed=#quiz-section",
 "?quiz=random&qv=1&seed=ABC#quiz-section",
 "?quiz=random&qv=1&seed=ABCDEFGHIJKLM#quiz-section",
 "?quiz=random&qv=1&seed=ABC-1#quiz-section",
 "?quiz=random&qv=1&seed=ABCD&ticket=1#quiz-section",
 "?quiz=fixed&qv=1&ticket=03#quiz-section",
 "?quiz=fixed&qv=1&ticket=#quiz-section",
 "?quiz=fixed&qv=1&ticket=0#quiz-section",
 "?quiz=fixed&qv=1&ticket=8#quiz-section",
 "?quiz=fixed&qv=1&ticket=x#quiz-section",
 "?quiz=fixed&qv=1&ticket=3&seed=ABCD#quiz-section",
 "?quiz=setup&qv=1&strict=0#quiz-section",
 "?quiz=fixed&qv=1&ticket=3&score=8&total=10#quiz-section",
 "?quiz=random&qv=1&seed=ABCD&score=11&total=10#quiz-section",
 "?quiz=random&qv=1&seed=ABCD&score=8#quiz-section",
 "?quiz=random&qv=1&seed=ABCD&total=10#quiz-section",
 "?quiz=random&qv=1&seed=ABCD&score=-1&total=10#quiz-section",
 "?quiz=random&qv=1&seed=ABCD&score=08&total=10#quiz-section",
 "?quiz=random&qv=1&seed=ABCD&score=1.5&total=10#quiz-section",
 "?quiz=random&qv=1&seed=ABCD&score=9007199254740992&total=10#quiz-section",
 "?quiz=random&qv=1&seed=ABCD&score=8&total=10&autostart=1#quiz-section",
 "?quiz=random&qv=1&seed=ABCD&strict=#quiz-section",
 "?quiz=random&qv=1&seed=ABCD&strict=2#quiz-section",
 "?quiz=random&qv=1&seed=ABCD&autostart=0#quiz-section",
 "?quiz=random&qv=1&seed=ABCD&autostart=#quiz-section",
 "?qv=1#quiz-section",
 "?quiz=setup&qv=1#Quiz-section",
 "?quiz=setup&qv=1#quiz%2Dsection",
 "?quiz=setup&qv=1#quiz%252Dsection",
 "?quiz=setup&qv=1#quiz-section#x",
];
for(const s of invalid) assert(!parse(s).valid,`expected invalid: ${s}`);
const result=parse("?total=9&score=8&ticket=3&qv=1&quiz=fixed#quiz-section");
assert(result.valid && result.config.result.score===8 && result.route==="antipatterns.html?quiz=fixed&qv=1&ticket=3&score=8&total=9#quiz-section","result parse/serialization mismatch");
assert(api.absoluteUrl(result.route)==="https://host.test/repo/antipatterns.html?quiz=fixed&qv=1&ticket=3&score=8&total=9#quiz-section","absolute route must use document.baseURI");
console.log(`QUIZ_V1_URL_PASS valid=${valid.length} invalid=${invalid.length} canonical=ok`);
