import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "web/glossary.html"), "utf8");
const dataJs = fs.readFileSync(path.join(root, "web/glossary-data.js"), "utf8");

// Combine HTML with inline glossary-data for hermetic testing in JSDOM
const combinedHtml = html.replace('<script src="glossary-data.js"></script>', `<script>${dataJs}</script>`);

const dom = new JSDOM(combinedHtml, {
  runScripts: "dangerously",
  url: "https://host.test/repo/glossary.html",
  pretendToBeVisual: true
});

const doc = dom.window.document;
const win = dom.window;

// 1. Verify initial render of terms
const totalTerms = win.__GLOSSARY_DATA__.length;
assert(totalTerms >= 15, `Expected at least 15 terms in glossary data, got ${totalTerms}`);

const renderedCards = doc.querySelectorAll(".term-card");
assert.strictEqual(renderedCards.length, totalTerms, `Rendered cards (${renderedCards.length}) should match total terms (${totalTerms})`);

const termsTotalEl = doc.getElementById("terms-total");
assert.strictEqual(termsTotalEl.textContent, String(totalTerms), "Terms total counter should match rendered count");

// 2. Fulltext Search Test
const searchInput = doc.getElementById("glossary-search");
searchInput.value = "OpenSpec";
searchInput.dispatchEvent(new win.Event("input"));

const searchResults = doc.querySelectorAll(".term-card");
assert(searchResults.length > 0 && searchResults.length < totalTerms, "Search should filter matching terms");
const hasSpecFirst = Array.from(searchResults).some(card => card.id === "term-spec-first" || card.id === "term-openspec");
assert(hasSpecFirst, "Search for OpenSpec must include spec-first and openspec terms");

// Clear search
const clearBtn = doc.getElementById("search-clear-btn");
clearBtn.click();
assert.strictEqual(doc.querySelectorAll(".term-card").length, totalTerms, "Clearing search should restore all terms");

// 3. Search with non-matching query -> empty state
searchInput.value = "nonexistentkeyword12345";
searchInput.dispatchEvent(new win.Event("input"));
assert.strictEqual(doc.querySelectorAll(".term-card").length, 0, "No cards should be visible for non-matching query");
const emptyState = doc.getElementById("empty-state");
assert(!emptyState.classList.contains("hidden"), "Empty state should be displayed when no terms match");

// Reset via reset button
const resetBtn = doc.getElementById("reset-filters-btn");
resetBtn.click();
assert.strictEqual(doc.querySelectorAll(".term-card").length, totalTerms, "Reset button should restore all cards");
assert(emptyState.classList.contains("hidden"), "Empty state should be hidden after reset");

// 4. Language Switch Test (RU -> EN -> RU)
const langBtnEn = doc.getElementById("lang-btn-en");
const langBtnRu = doc.getElementById("lang-btn-ru");

langBtnEn.click();
assert.strictEqual(win.localStorage.getItem("aipdlc.glossary.lang.v1"), "en", "Language switch to EN must be persisted in localStorage");
assert.strictEqual(langBtnEn.getAttribute("aria-pressed"), "true", "EN button should be pressed");
const firstCardTitleEn = doc.querySelector(".term-card h2").textContent;
assert(firstCardTitleEn.includes("Spec-First Development"), "First card title should be in English after toggle");

langBtnRu.click();
assert.strictEqual(win.localStorage.getItem("aipdlc.glossary.lang.v1"), "ru", "Language switch back to RU must be persisted");
const firstCardTitleRu = doc.querySelector(".term-card h2").textContent;
assert(firstCardTitleRu.includes("Spec-First (Спецификация прежде кода)"), "First card title should be in Russian after toggle");

// 5. Bookmarks Management Test
const bookmarksBadge = doc.getElementById("bookmarks-badge");
assert.strictEqual(bookmarksBadge.textContent, "0", "Initial bookmarks count should be 0");

// Bookmark first card
const firstBookmarkBtn = doc.querySelector(".term-card .bookmark-btn");
const termId = firstBookmarkBtn.dataset.id;
firstBookmarkBtn.click();

assert.strictEqual(bookmarksBadge.textContent, "1", "Bookmarks badge should update to 1");
const savedBookmarks = JSON.parse(win.localStorage.getItem("aipdlc.glossary.bookmarks.v1") || "[]");
assert(savedBookmarks.includes(termId), "Bookmarked ID must be saved in localStorage");

// Filter by bookmarks
const toggleBookmarksBtn = doc.getElementById("toggle-bookmarks-btn");
toggleBookmarksBtn.click();
const bookmarkedCards = doc.querySelectorAll(".term-card");
assert.strictEqual(bookmarkedCards.length, 1, "Only bookmarked cards should be shown when bookmarks filter is active");
assert.strictEqual(bookmarkedCards[0].id, `term-${termId}`, "Visible card must be the bookmarked card");

// Toggle bookmarks filter off
toggleBookmarksBtn.click();
assert.strictEqual(doc.querySelectorAll(".term-card").length, totalTerms, "All cards should return when bookmarks filter is toggled off");

// Unbookmark
doc.querySelector(`.bookmark-btn[data-id="${termId}"]`).click();
assert.strictEqual(bookmarksBadge.textContent, "0", "Bookmarks badge should update to 0 after unbookmarking");

// 6. Categories Filter Test
const coreFilterBtn = doc.querySelector('.category-filter-btn[data-category="core"]');
assert(coreFilterBtn, "Category button for core must exist");
coreFilterBtn.click();
const coreCards = doc.querySelectorAll(".term-card");
assert(coreCards.length > 0 && coreCards.length < totalTerms, "Category filter should narrow down cards");

// Reset categories
doc.querySelector('.category-filter-btn[data-category="all"]').click();
assert.strictEqual(doc.querySelectorAll(".term-card").length, totalTerms, "All categories should return all cards");

// 7. Header and Footer Contract Verification
assert(doc.querySelector("[data-site-header]"), "data-site-header must be present");
assert(doc.querySelector(".site-nav-row"), "site-nav-row must be present");
assert(doc.querySelector(".site-brand-row"), "site-brand-row must be present");
const activeNavLink = doc.querySelector('nav a[aria-current="page"]');
assert.strictEqual(activeNavLink.textContent.trim(), "Глоссарий", "Active nav link on glossary.html must be 'Глоссарий'");

assert(doc.querySelector("footer[data-site-footer]"), "data-site-footer must be present");
const footerText = doc.querySelector("footer[data-site-footer]").textContent;
assert(footerText.includes("aipdlc.ru") && footerText.includes("Сбербанк") && footerText.includes("xsa-dev"), "Footer must include full attribution contract");

console.log(`GLOSSARY_DOM_PASS terms=${totalTerms} search=ok lang=ok bookmarks=ok header=ok footer=ok`);
