import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const code = fs.readFileSync(new URL('../web/book-assistant-widget.js', import.meta.url), 'utf8');
const pages = fs.readdirSync(new URL('../web/', import.meta.url)).filter(name => name.endsWith('.html'));
for (const page of pages) {
const html = fs.readFileSync(new URL(`../web/${page}`, import.meta.url), 'utf8');
const dom = new JSDOM(html, { url: `https://xsa-dev.github.io/ai-disrupt-pdlc-coach/${page}`, runScripts: 'outside-only' });
const script = dom.window.document.querySelector('script[src="book-assistant-widget.js"]');
assert.equal(dom.window.document.querySelectorAll('script[src="book-assistant-widget.js"]').length, 1, `${page} must include the widget exactly once`);
assert.equal(script.dataset.assistantUrl, 'https://0xhash.ru/pdlc');
Object.defineProperty(dom.window.document, 'currentScript', { get: () => script });
dom.window.eval(code);
const host = [...dom.window.document.body.children].find(node => node.shadowRoot);
assert.ok(host, 'styles are isolated in a shadow root');
const root = host.shadowRoot;
const frame = root.querySelector('iframe');
const launcher = root.querySelector('.launcher');
const panel = root.querySelector('.panel');
assert.equal(frame.getAttribute('src'), null, 'no backend load before opening');
assert.equal(panel.hidden, true);
launcher.click();
assert.equal(panel.hidden, false);
assert.equal(frame.src, 'https://0xhash.ru/pdlc/?embed=1&v=3', 'path prefix must be preserved');
assert.equal(launcher.getAttribute('aria-expanded'), 'true');
assert.equal(new URL(frame.src).searchParams.get('embed'), '1');
assert.equal(new URL(frame.src).searchParams.get('v'), '3');
assert.ok(!new URL(frame.src).searchParams.has('profile'), 'no assessment profile is transmitted');
root.querySelector('.close').click();
assert.equal(panel.hidden, true);
assert.equal(root.activeElement, launcher);
launcher.click();
launcher.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
assert.equal(panel.hidden, true);
if (page === 'diagnosis.html') assert.ok(dom.window.document.querySelector('#start-screen'), 'diagnosis workflow is preserved');
dom.window.close();
}
console.log(`book assistant: lazy load, HTTPS path, close, Escape and focus checks passed on ${pages.length} pages`);
