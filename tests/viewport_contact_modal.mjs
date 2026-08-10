// Contact modal acceptance: real Chrome --dump-dom render check (no WebSocket needed).
// Proves contact-modal.js executes and injects the modal markup into the live DOM.
import { spawn } from 'child_process';
import { setTimeout as sleep } from 'timers/promises';
import { execSync } from 'child_process';

const PORT = 8098;
const ROOT = new URL('../../web/', import.meta.url).pathname;
const URL_ = `http://127.0.0.1:${PORT}/antipatterns.html`;

const tests = [];
const check = (n, c) => tests.push([n, !!c]);

async function run() {
  // Assumes a static server is already serving web/ on PORT (started out-of-band).
  await sleep(400);

  // Render with JS executed, dump final DOM.
  let dom = '';
  try {
    dom = execSync(
      `timeout 40 google-chrome --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage ` +
      `--user-data-dir=/tmp/chrome-cdp-${PORT}-${process.pid} --virtual-time-budget=4000 --dump-dom ${URL_}`,
      { encoding: 'utf8' }
    );
  } catch (e) { dom = e.stdout || ''; }
  console.log('DOM bytes:', dom.length);

  check('FAB button present in rendered DOM', /class="contact-fab"/.test(dom));
  check('modal dialog role+aria', /role="dialog"[^>]*aria-modal="true"|aria-modal="true"[^>]*role="dialog"|role="dialog"[\s\S]*?aria-modal="true"/.test(dom));
  check('three contact links present', (dom.match(/contact-contacts/g) || []).length >= 1 && /t\.me\/alxy_tg/.test(dom) && /github\.com\/xsa-dev/.test(dom) && /mailto:saleksey67@gmail\.com/.test(dom));
  check('message field present', /id="contact-msg"/.test(dom));
  check('send button present', /class="contact-send"/.test(dom));
  check('endpoint wired in body', /data-contact-endpoint="https:\/\/formspree\.io\/f\/xgawanjd"/.test(dom));

  let pass = 0;
  for (const [n, ok] of tests) { console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); if (ok) pass++; }
  console.log(`\n${pass}/${tests.length} passed`);
  process.exit(pass === tests.length ? 0 : 1);
}
run().catch(e => { console.error(e); process.exit(2); });
