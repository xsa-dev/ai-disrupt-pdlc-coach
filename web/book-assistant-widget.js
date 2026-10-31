(() => {
  'use strict';
  const script = document.currentScript;
  const assistantUrl = new URL(script.dataset.assistantUrl || '../', script.src);
  const development = ['localhost', '127.0.0.1'].includes(assistantUrl.hostname);
  if (assistantUrl.protocol !== 'https:' && !(development && assistantUrl.protocol === 'http:')) throw new Error('Assistant URL must use HTTPS');
  assistantUrl.pathname = assistantUrl.pathname.replace(/\/$/, '') + '/'; assistantUrl.search = '?embed=1&v=3'; assistantUrl.hash = '';
  const host = document.createElement('div'); document.body.append(host);
  const root = host.attachShadow({mode: 'open'});
  const style = document.createElement('style');
  style.textContent = ':host{position:fixed;right:24px;bottom:88px;z-index:2147483000;font-family:system-ui,sans-serif}button{font:inherit;cursor:pointer}.launcher{background:#087653;color:white;border:0;border-radius:30px;padding:15px 22px;box-shadow:0 6px 25px #163b2630;font-size:14px}.panel{position:absolute;right:0;bottom:65px;width:min(480px,calc(100vw - 32px));height:min(730px,calc(100dvh - 190px));background:white;border-radius:16px;box-shadow:0 12px 55px #173c3330;overflow:hidden;border:1px solid #dfe9dd}.panel[hidden]{display:none}.close{position:absolute;right:10px;top:4px;background:white;border:0;color:#637b65;font-size:20px;z-index:1;width:28px;height:28px;border-radius:50%}iframe{border:0;width:100%;height:100%}button:focus-visible{outline:3px solid #7cbb8f;outline-offset:3px}@media(max-width:600px){:host{right:16px;bottom:88px}.launcher{font-size:12px;padding:13px 17px}}';
  const panel = document.createElement('section'); panel.className = 'panel'; panel.hidden = true; panel.id = 'pdlc-panel'; panel.setAttribute('aria-label', 'Диалог с книгой');
  const frame = document.createElement('iframe'); frame.title = 'Помощник по книге AI-Disrupt PDLC'; frame.referrerPolicy = 'no-referrer';
  const close = document.createElement('button'); close.className = 'close'; close.textContent = '×'; close.setAttribute('aria-label', 'Закрыть помощника');
  const launcher = document.createElement('button'); launcher.className = 'launcher'; launcher.textContent = '✳ Спросить книгу'; launcher.setAttribute('aria-expanded', 'false'); launcher.setAttribute('aria-controls', 'pdlc-panel');
  function toggle(open) { panel.hidden = !open; launcher.setAttribute('aria-expanded', String(open)); if (open && !frame.src) frame.src = assistantUrl.href; if (!open) launcher.focus(); }
  launcher.addEventListener('click', () => toggle(panel.hidden)); close.addEventListener('click', () => toggle(false));
  root.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });
  panel.append(frame, close); root.append(style, panel, launcher);
})();
