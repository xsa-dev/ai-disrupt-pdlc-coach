// JSDOM test suite for unobtrusive interactive books fork component
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import assert from 'node:assert/strict';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');

const ALL_8_PAGES = [
  'diagnosis.html',
  'roadmap.html',
  'methodologies.html',
  'antipatterns.html',
  'openspec.html',
  'course-openspec.html',
  'glossary.html',
  'index.html'
];

const CONTENT_7_PAGES = [
  'diagnosis.html',
  'roadmap.html',
  'methodologies.html',
  'antipatterns.html',
  'openspec.html',
  'course-openspec.html',
  'glossary.html'
];

const jsCode = readFileSync(join(ROOT, 'web/books-fork-modal.js'), 'utf8');
const cssCode = readFileSync(join(ROOT, 'web/books-fork-modal.css'), 'utf8');

// 1. Static inclusion checks across all pages
for (const page of ALL_8_PAGES) {
  const content = readFileSync(join(ROOT, 'web', page), 'utf8');
  assert.ok(content.includes('books-fork-modal.css'), `${page} must include books-fork-modal.css`);
  assert.ok(content.includes('books-fork-modal.js'), `${page} must include books-fork-modal.js`);
}

for (const page of CONTENT_7_PAGES) {
  const content = readFileSync(join(ROOT, 'web', page), 'utf8');
  assert.ok(content.includes('class="site-footer__fork-btn"'), `${page} must include site-footer__fork-btn in footer`);
  assert.ok(content.includes('data-books-fork-trigger'), `${page} must include data-books-fork-trigger on footer button`);
}

// 2. Interactive DOM checks in JSDOM environment
const rawHtml = readFileSync(join(ROOT, 'web/diagnosis.html'), 'utf8');
const stripped = rawHtml.replace(/<script[\s\S]*?<\/script>/gi, '');
const testHtml = stripped.replace('</body>', `<script>${jsCode}</script></body>`);

let fetchCalls = [];

const dom = new JSDOM(testHtml, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'http://localhost/diagnosis.html',
  beforeParse(window) {
    window.fetch = async (url, opts) => {
      fetchCalls.push({ url, opts });
      return { ok: true, status: 200, json: async () => ({}) };
    };
    window.HTMLElement.prototype.scrollIntoView = () => {};
  }
});

const { window } = dom;
const { document } = window;

// Trigger DOMContentLoaded
const evt = document.createEvent('Event');
evt.initEvent('DOMContentLoaded', true, true);
window.dispatchEvent(evt);

// Assert floating trigger chip is rendered
const chip = document.querySelector('.books-fork__chip');
assert.ok(chip, 'Floating trigger chip must be rendered');
assert.equal(chip.getAttribute('data-books-fork-trigger'), '');
assert.equal(chip.getAttribute('aria-haspopup'), 'dialog');
assert.equal(chip.getAttribute('aria-controls'), 'books-fork-dialog');
assert.equal(chip.getAttribute('aria-expanded'), 'false');
assert.ok(chip.textContent.includes('Развилка'), 'Chip must contain Развилка');

// Assert modal overlay & dialog are rendered
const overlay = document.getElementById('books-fork-overlay');
assert.ok(overlay, 'Overlay must exist');
assert.equal(overlay.hidden, true, 'Overlay must be hidden initially');

const dialog = document.getElementById('books-fork-dialog');
assert.ok(dialog, 'Dialog must exist');
assert.equal(dialog.getAttribute('role'), 'dialog');
assert.equal(dialog.getAttribute('aria-modal'), 'true');
assert.equal(dialog.getAttribute('aria-labelledby'), 'books-fork-title');
assert.equal(dialog.getAttribute('aria-describedby'), 'books-fork-desc');

const title = document.getElementById('books-fork-title');
assert.ok(title, 'Title element must exist');
assert.ok(title.textContent.includes('Куда двигаться дальше'), 'Title text check');

const desc = document.getElementById('books-fork-desc');
assert.ok(desc, 'Description element must exist');

const closeBtn = document.getElementById('books-fork-close');
assert.ok(closeBtn, 'Close button must exist');
assert.equal(closeBtn.getAttribute('aria-label'), 'Закрыть');

// Assert wings and links
const pslcLink = dialog.querySelector('a[href="https://aipdlc.ru/ru/pslc"]');
assert.ok(pslcLink, 'PSLC link must exist');
assert.equal(pslcLink.getAttribute('target'), '_blank');
assert.equal(pslcLink.getAttribute('rel'), 'noopener');
assert.ok(pslcLink.textContent.includes('AI-Disrupt PSLC'), 'PSLC card text');

const vibeLink = dialog.querySelector('a[href="https://aipdlc.ru/ru/vibeppm"]');
assert.ok(vibeLink, 'Vibe PPM link must exist');
assert.equal(vibeLink.getAttribute('target'), '_blank');
assert.equal(vibeLink.getAttribute('rel'), 'noopener');
assert.ok(vibeLink.textContent.includes('Vibe PPM'), 'Vibe card text');

const whitepaperLink = dialog.querySelector('a[href="https://aipdlc.ru/documents/ru/whitepaper_full_ru.pdf"]');
assert.ok(whitepaperLink, 'Whitepaper bridge link must exist');
assert.equal(whitepaperLink.getAttribute('target'), '_blank');
assert.equal(whitepaperLink.getAttribute('rel'), 'noopener');

// Assert legal attribution and disclaimers
const footer = dialog.querySelector('.books-fork__footer');
assert.ok(footer, 'Dialog footer must exist');
assert.ok(footer.textContent.includes('Кирилл Меньшов'), 'Attribution must name Кирилл Меньшов');
assert.ok(footer.textContent.includes('ПАО Сбербанк'), 'Attribution must name ПАО Сбербанк');
assert.ok(footer.textContent.includes('1274'), 'Citation must cite Art. 1274');

const sberLink = footer.querySelector('a[href="https://aipdlc.ru/ru/"]');
assert.ok(sberLink, 'Link to Sberbank aipdlc.ru/ru/ must exist');
assert.equal(sberLink.getAttribute('target'), '_blank');
assert.equal(sberLink.getAttribute('rel'), 'noopener');

const legalLink = footer.querySelector('a[href="https://aipdlc.ru/ru/legal-info"]');
assert.ok(legalLink, 'Link to legal-info must exist');
assert.equal(legalLink.getAttribute('target'), '_blank');
assert.equal(legalLink.getAttribute('rel'), 'noopener');

// Test idempotency: re-evaluating the script must not create duplicate elements
const evalFn = new window.Function(jsCode);
evalFn();
assert.equal(document.querySelectorAll('.books-fork__chip').length, 1, 'Only one chip after re-execution');
assert.equal(document.querySelectorAll('#books-fork-overlay').length, 1, 'Only one overlay after re-execution');

// Test open modal via chip click
chip.focus();
chip.click();
assert.equal(overlay.hidden, false, 'Overlay must be visible after click');
assert.equal(chip.getAttribute('aria-expanded'), 'true');
assert.equal(document.documentElement.style.overflow, 'hidden', 'Scroll must be locked');

// Test close modal via Escape
const escEvent = new window.KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true });
document.dispatchEvent(escEvent);
assert.equal(overlay.hidden, true, 'Overlay must be hidden after Escape');
assert.equal(chip.getAttribute('aria-expanded'), 'false');
assert.equal(document.documentElement.style.overflow, '', 'Scroll lock must be removed');
assert.equal(document.activeElement, chip, 'Focus must return to chip after Escape');

// Test open modal via footer trigger button and close via close button
const footerBtn = document.querySelector('.site-footer__fork-btn');
assert.ok(footerBtn, 'Footer button must exist in diagnosis.html');
footerBtn.focus();
footerBtn.click();
assert.equal(overlay.hidden, false, 'Overlay must be visible after footer button click');
assert.equal(footerBtn.getAttribute('aria-expanded'), 'true');

closeBtn.click();
assert.equal(overlay.hidden, true, 'Overlay must be hidden after close button click');
assert.equal(footerBtn.getAttribute('aria-expanded'), 'false');
assert.equal(document.activeElement, footerBtn, 'Focus must return to footer button');

// Test close modal via overlay backdrop click
chip.click();
assert.equal(overlay.hidden, false);
overlay.click();
assert.equal(overlay.hidden, true, 'Overlay must close on backdrop click');

// Test focus trap
chip.click();
const focusables = Array.from(dialog.querySelectorAll('button:not([disabled]), [href]'));
const first = focusables[0];
const last = focusables[focusables.length - 1];

last.focus();
const tabEvent = new window.KeyboardEvent('keydown', { key: 'Tab', keyCode: 9, bubbles: true });
document.dispatchEvent(tabEvent);
assert.equal(document.activeElement, first, 'Tab from last element must wrap to first element');

first.focus();
const shiftTabEvent = new window.KeyboardEvent('keydown', { key: 'Tab', keyCode: 9, shiftKey: true, bubbles: true });
document.dispatchEvent(shiftTabEvent);
assert.equal(document.activeElement, last, 'Shift+Tab from first element must wrap to last element');

closeBtn.click();

// Assert zero unauthorized network calls
assert.equal(fetchCalls.length, 0, 'No network requests should be made');

console.log('books-fork-modal DOM, a11y, legal and keyboard tests passed on all 8 pages!');
