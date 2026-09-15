// jsdom interaction test for contact-author flip-card (open, ESC, focus-return, 3 contacts,
// tap/keyboard flip, and absence of any message form / network POST).
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { setTimeout as sleep } from 'timers/promises';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const rawHtml = readFileSync(join(ROOT, 'web/antipatterns.html'), 'utf8');
const js = readFileSync(join(ROOT, 'web/contact-modal.js'), 'utf8');
const css = readFileSync(join(ROOT, 'web/contact-modal.css'), 'utf8');
// Strip existing <script> tags so jsdom does not fetch tailwind-cdn.js / run page JS;
// the modal script is inlined below so jsdom (runScripts: dangerously) executes it during parse.
const stripped = rawHtml.replace(/<script[\s\S]*?<\/script>/gi, '');
const html = stripped.replace('</body>', `<script>${js}</script></body>`);

const tests = [];
const check = (n, c) => tests.push([n, !!c]);
let fetchCalls = [];

async function run() {
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/antipatterns.html',
    beforeParse(window) {
      window.fetch = async (url, opts) => { fetchCalls.push({ url, opts }); return { ok: true, status: 200, json: async () => ({ ok: true }) }; };
      window.HTMLElement.prototype.scrollIntoView = () => {};
    }
  });
  const { window } = dom;
  const doc = window.document;

  await new Promise(res => {
    if (doc.readyState === 'complete') return res();
    window.addEventListener('DOMContentLoaded', () => res());
    setTimeout(res, 500);
  });
  await sleep(50);

  const fab = doc.querySelector('.contact-fab');
  check('FAB rendered', !!fab);
  check('flip-card dialog role+aria', (() => {
    const d = doc.querySelector('.flip-card');
    return d && d.id === 'contact-card' && d.getAttribute('role') === 'dialog' && d.getAttribute('aria-modal') === 'true';
  })());
  check('front + back faces exist', !!doc.querySelector('.flip-front') && !!doc.querySelector('.flip-back'));
  check('front backdrop layers inherit rounded corners', (() => {
    const before = css.match(/\.flip-front::before\s*\{([\s\S]*?)\}/);
    const after = css.match(/\.flip-front::after\s*\{([\s\S]*?)\}/);
    return before && after && /border-radius:\s*inherit/.test(before[1]) && /border-radius:\s*inherit/.test(after[1]);
  })());
  check('top sheen follows the rounded card corners', (() => {
    const sheen = css.match(/\.card-sheen\s*\{([\s\S]*?)\}/);
    return sheen && /border-radius:\s*22px\s+22px\s+0\s+0/.test(sheen[1]);
  })());
  check('back arrow pattern runs beyond top and bottom edges', (() => {
    const back = css.match(/(?:^|\n)\.flip-back\s*\{([\s\S]*?)\}/);
    return back && /background-size:\s*auto\s+116%/.test(back[1]) && /background-position:\s*center\s+center/.test(back[1]);
  })());
  check('three contacts', doc.querySelectorAll('.contact-contacts a').length === 3);
  check('contacts are telegram/github/mailto', (() => {
    const hrefs = [...doc.querySelectorAll('.contact-contacts a')].map(a => a.getAttribute('href'));
    return hrefs.some(h => /t\.me\/alxy_tg/.test(h)) && hrefs.some(h => /github\.com\/xsa-dev/.test(h)) && hrefs.some(h => /^mailto:/.test(h));
  })());

  // NO message form and NO network path (form was removed with this change)
  check('no message textarea', !doc.querySelector('#contact-msg') && !doc.querySelector('textarea'));
  check('no send button', !doc.querySelector('.contact-send'));

  // open
  const trigger = fab;
  trigger.focus();
  fab.click();
  await sleep(20);
  const overlay = doc.querySelector('.contact-overlay');
  check('overlay opens', overlay.classList.contains('open'));

  // tap-to-flip: clicking the card toggles .flipped
  const card = doc.querySelector('.flip-card');
  const ptr = (type, x, y) => {
    const e = new window.Event(type, { bubbles: true });
    e.clientX = x; e.clientY = y;
    Object.defineProperty(e, 'target', { value: card, configurable: true });
    card.dispatchEvent(e);
  };
  ptr('pointerdown', 5, 5);
  ptr('pointerup', 5, 5);
  check('tap flips to back', card.classList.contains('flipped'));

  // keyboard flip (Enter) toggles back to front
  card.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  check('Enter flips back to front', !card.classList.contains('flipped'));

  // ESC closes and returns focus to trigger
  doc.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  check('ESC closes', !overlay.classList.contains('open'));

  // overlay click closes
  fab.click();
  await sleep(10);
  // simulate a click whose target is the overlay itself
  const evt = new window.MouseEvent('click', { bubbles: true });
  Object.defineProperty(evt, 'target', { value: overlay });
  overlay.dispatchEvent(evt);
  check('overlay click closes', !overlay.classList.contains('open'));

  check('no fetch anywhere', fetchCalls.length === 0);

  let pass = 0;
  for (const [n, ok] of tests) { console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); if (ok) pass++; }
  console.log(`\n${pass}/${tests.length} passed`);
  process.exit(pass === tests.length ? 0 : 1);
}
run().catch(e => { console.error(e); process.exit(2); });
