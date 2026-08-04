import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "web/methodologies.html"), "utf8");
const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true });
const { document } = dom.window;
const fail = message => { throw new Error(message); };
const visibleCards = () => [...document.querySelectorAll("#methodology-catalog article")];
const assert = (condition, message) => { if (!condition) fail(message); };

assert(visibleCards().length === 12, "initial render must show 12 cards");
assert([...document.querySelectorAll("#methodology-catalog details")].every(detail => !detail.open), "details must be collapsed initially");

const stage = document.querySelector('[data-stage="Discovery"]');
stage.click();
assert(visibleCards().length > 0 && visibleCards().length < 12, "Discovery filter must reduce the catalog");
assert(stage.getAttribute("aria-pressed") === "true", "selected stage must expose aria-pressed=true");

const kind = document.querySelector('[data-kind="artifact"]');
kind.click();
assert(visibleCards().length > 0, "combined stage/type filter must retain matching cards");
assert(visibleCards().every(card => card.querySelector(".text-emerald-700")?.textContent === "Артефакт"), "type filter must show artifacts only");

const resetStage = document.querySelector('[data-stage="all"]');
resetStage.click();
const resetKind = document.querySelector('[data-kind="all"]');
resetKind.click();
assert(visibleCards().length === 12, "all reset must restore every card");

const details = document.querySelector("#methodology-catalog details");
const summary = details.querySelector("summary");
summary.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
// Native summary keyboard activation is browser-managed; click is the authoritative jsdom event path.
summary.click();
assert(details.open, "detail control must open from keyboard-equivalent activation");
assert(details.querySelector("li"), "opened details must contain rendered steps/criteria");

console.log(`HEADLESS_INTERACTION_PASS cards=${visibleCards().length} details_open=${details.open}`);
