import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "web/antipatterns.html"), "utf8");
const dom = new JSDOM(html, { runScripts: "dangerously", url: "https://example.test/project/antipatterns.html" });
const api = dom.window.__QUIZ_V1__;
const assert = (value, message) => { if (!value) throw new Error(message); };
assert(api, "Quiz v1 test API must be exposed");
assert(api.questions.length === 62, "canonical registry must contain 62 questions");
assert(new Set(api.questions.map(q => q.id)).size === 62, "question IDs must be unique");
const completeIds=Array.from({length:31},(_,i)=>[`ap-${String(i+1).padStart(2,"0")}:definition`,`ap-${String(i+1).padStart(2,"0")}:fix`]).flat();
assert(JSON.stringify(api.questions.map(q=>q.id))===JSON.stringify(completeIds),"complete canonical ID sequence mismatch");
assert(api.questions[0].id === "ap-01:definition" && api.questions[1].id === "ap-01:fix", "canonical order must interleave definition/fix");
assert(api.questions[0].correct === "Множество инструментов без оркестрации.", "definition answer must resolve from registry.sign");
assert(api.questions[1].correct === "IDP с единой средой исполнения.", "fix answer must resolve from registry.fix");
assert(api.questions.at(-1).id === "ap-31:fix", "canonical order must end at ap-31:fix");
assert(api.fnv1a("AI-DISRUPT-QUIZ|qv=1|random|seed=8K3M") === 0xD121509A, "FNV-1a golden hash mismatch");
const rng = api.mulberry32(0xD121509A);
assert(JSON.stringify(Array.from({length:5}, () => rng.nextUint32())) === JSON.stringify([3616126141,3492414029,2295842057,4125266647,3602705234]), "Mulberry32 golden stream mismatch");
let draws=0; const fake={nextFloat(){return [0,0.25,0.5,0.75][draws++];}};
assert(JSON.stringify(api.seededShuffle([0,1,2,3,4],fake))===JSON.stringify([4,2,3,1,0])&&draws===4,"descending Fisher-Yates bounds/draw count mismatch");
const random = api.generateChallenge({ mode:"random", seed:"8K3M", strict:false });
const expected = [
 ["ap-31:fix",["ap-16","ap-17","ap-09"],["ap-16","ap-17","ap-31","ap-09"]],
 ["ap-11:fix",["ap-30","ap-06","ap-23"],["ap-23","ap-30","ap-06","ap-11"]],
 ["ap-06:definition",["ap-13","ap-24","ap-17"],["ap-17","ap-06","ap-13","ap-24"]],
 ["ap-09:fix",["ap-25","ap-05","ap-03"],["ap-05","ap-09","ap-25","ap-03"]],
 ["ap-10:definition",["ap-21","ap-13","ap-27"],["ap-27","ap-13","ap-21","ap-10"]],
 ["ap-18:fix",["ap-12","ap-17","ap-02"],["ap-17","ap-12","ap-02","ap-18"]],
 ["ap-30:definition",["ap-13","ap-23","ap-04"],["ap-13","ap-23","ap-30","ap-04"]],
 ["ap-24:fix",["ap-07","ap-05","ap-13"],["ap-24","ap-07","ap-05","ap-13"]],
 ["ap-01:fix",["ap-15","ap-07","ap-10"],["ap-15","ap-07","ap-10","ap-01"]],
 ["ap-03:fix",["ap-28","ap-26","ap-04"],["ap-03","ap-28","ap-26","ap-04"]]
];
assert(JSON.stringify(random.map(q => [q.id,q.distractorSourceIds,q.optionSourceIds])) === JSON.stringify(expected), "seed 8K3M challenge vector mismatch");
const fixed = Array.from({length:7}, (_, i) => api.generateChallenge({mode:"fixed",ticket:i+1,strict:false}));
assert(JSON.stringify(fixed.map(x => x.length)) === JSON.stringify([9,9,9,9,9,9,8]), "fixed ticket sizes mismatch");
assert(new Set(fixed.flat().map(q => q.id)).size === 62, "fixed tickets must partition all questions");
assert(JSON.stringify(fixed[2].map(q=>q.id))===JSON.stringify(completeIds.slice(18,27)),"fixed ticket 3 complete question vector mismatch");
assert(JSON.stringify(fixed[2].slice(0,2).map(q => [q.id,q.optionSourceIds])) === JSON.stringify([
 ["ap-10:definition",["ap-31","ap-10","ap-23","ap-12"]],
 ["ap-10:fix",["ap-10","ap-01","ap-17","ap-23"]]
]), "fixed ticket 3 golden vector mismatch");
assert(!/Math\.random\s*\(/.test(html), "versioned Quiz source must not use Math.random");
console.log("QUIZ_V1_PRIMITIVES_PASS questions=62 random=10 fixed=9,9,9,9,9,9,8");
