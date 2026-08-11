// jsdom interaction test for contact-author modal (open, ESC, focus-trap, mailto, webhook+fallback).
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { setTimeout as sleep } from 'timers/promises';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const rawHtml = readFileSync(join(ROOT, 'web/antipatterns.html'), 'utf8');
const js = readFileSync(join(ROOT, 'web/contact-modal.js'), 'utf8');
// Strip all existing <script> tags so jsdom does not fetch tailwind-cdn.js / run page JS;
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

  // wait for DOMContentLoaded so init() builds the modal
  await new Promise(res => {
    if (doc.readyState === 'complete') return res();
    window.addEventListener('DOMContentLoaded', () => res());
    setTimeout(res, 500);
  });
  await sleep(50);

  const fab = doc.querySelector('.contact-fab');
  check('FAB rendered', !!fab);
  check('dialog role+aria', (() => { const d = doc.querySelector('.contact-modal'); return d && d.getAttribute('role') === 'dialog' && d.getAttribute('aria-modal') === 'true'; })());
  check('three contacts', doc.querySelectorAll('.contact-contacts a').length === 3);

  fab.click();
  check('modal opens', doc.querySelector('.contact-overlay').classList.contains('open'));

  doc.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  check('ESC closes', !doc.querySelector('.contact-overlay').classList.contains('open'));

  fab.click();
  doc.querySelector('.contact-close').focus();
  doc.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
  check('focus-trap keeps focus in modal', doc.querySelector('.contact-overlay').contains(doc.activeElement));

  // mailto default: remove endpoint, ensure NO fetch and status mentions mail client
  doc.body.removeAttribute('data-contact-endpoint');
  fetchCalls = [];
  doc.querySelector('#contact-msg').value = 'Hello from jsdom';
  doc.querySelector('.contact-send').click();
  const statusMail = doc.querySelector('.contact-status').textContent;
  check('no fetch on mailto path', fetchCalls.length === 0);
  check('mailto path shows mail-client guidance', /почтовый клиент|напишите/.test(statusMail));

  // webhook path: endpoint set, fetch mocked ok
  fetchCalls = [];
  doc.body.setAttribute('data-contact-endpoint', 'https://formspree.io/f/xgawanjd');
  doc.querySelector('#contact-msg').value = 'Webhook hi';
  doc.querySelector('.contact-send').click();
  await sleep(50);
  check('webhook POST called', fetchCalls.length === 1 && /formspree\.io\/f\/xgawanjd/.test(fetchCalls[0].url));
  check('webhook body JSON has email+message', (() => { try { const b = JSON.parse(fetchCalls[0].opts.body); return b.email === 'saleksey67@gmail.com' && b.message === 'Webhook hi' && !!b._subject; } catch { return false; } })());
  check('webhook Content-Type json + credentials omit', fetchCalls[0].opts.headers['Content-Type'] === 'application/json' && fetchCalls[0].opts.credentials === 'omit');

  // webhook failure -> fallback (status mentions mail client again)
  fetchCalls = [];
  window.fetch = async () => { throw new Error('network'); };
  doc.querySelector('#contact-msg').value = 'Fail msg';
  doc.querySelector('.contact-send').click();
  await sleep(50);
  const statusFail = doc.querySelector('.contact-status').textContent;
  check('webhook failure shows fallback guidance', /почтовый клиент|напишите/.test(statusFail));

  let pass = 0;
  for (const [n, ok] of tests) { console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); if (ok) pass++; }
  console.log(`\n${pass}/${tests.length} passed`);
  process.exit(pass === tests.length ? 0 : 1);
}
run().catch(e => { console.error(e); process.exit(2); });
