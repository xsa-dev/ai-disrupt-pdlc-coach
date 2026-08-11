// Webhook delivery test for contact modal: real Formspree POST + simulated failure fallback.
import { setTimeout as sleep } from 'timers/promises';

const ENDPOINT = 'https://formspree.io/f/xgawanjd';
const BAD = 'https://formspree.io/f/does-not-exist-zzz';

async function postWebhook(url, body) {
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body), credentials: 'omit'
    });
    return { ok: r.ok, status: r.status, json: r.ok ? await r.json().catch(() => null) : null };
  } catch (e) { return { ok: false, status: 0, error: e.message }; }
}

const tests = [];
const check = (n, c) => tests.push([n, !!c]);

const good = await postWebhook(ENDPOINT, { email: 'test@hermes.local', message: 'WEBHOOK TEST — please ignore', _subject: 'Связь с автором — AI Disrupt PDLC' });
check('real Formspree POST returns 2xx', good.ok && good.status === 200);
check('Formspree response ok:true', good.json && good.json.ok === true);

const bad = await postWebhook(BAD, { email: 'test@hermes.local', message: 'x', _subject: 'y' });
check('bad endpoint fails (triggers fallback)', !bad.ok);

const mailtoFallback = (text) => `mailto:saleksey67@gmail.com?subject=${encodeURIComponent('Связь с автором — AI Disrupt PDLC')}&body=${encodeURIComponent(text)}`;
check('mailto fallback forms valid URI', /^mailto:saleksey67@gmail.com\?subject=/.test(mailtoFallback('hi')));

let pass = 0;
for (const [n, ok] of tests) { console.log((ok ? 'PASS' : 'FAIL') + '  ' + n); if (ok) pass++; }
console.log(`\n${pass}/${tests.length} passed`);
console.log('NOTE: real test message was sent to Formspree (check xgawanjd inbox).');
process.exit(pass === tests.length ? 0 : 1);
