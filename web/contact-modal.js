/* Contact Author Modal — no dependencies, vanilla JS.
 * Default: mailto:. Optional webhook via data-contact-endpoint (https:// only).
 * Verified endpoint: https://formspree.io/f/xgawanjd
 */
(function () {
  'use strict';
  window.__contactLoaded = true;

  var FAB_LABEL = 'Связь с автором';
  var EMAIL = 'saleksey67@gmail.com';

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }

  function buildModal(root) {
    var endpoint = root.getAttribute('data-contact-endpoint') || '';
    var email = root.getAttribute('data-contact-email') || EMAIL;
    if (endpoint && !/^https:\/\//i.test(endpoint)) endpoint = ''; // https-only, no creds

    var fab = el('button', {
      type: 'button', class: 'contact-fab', 'aria-haspopup': 'dialog',
      'aria-controls': 'contact-dialog'
    }, [document.createTextNode('✉ ' + FAB_LABEL)]);

    var closeBtn = el('button', { type: 'button', class: 'contact-close', 'aria-label': 'Закрыть' }, [document.createTextNode('×')]);
    var title = el('h2', { id: 'contact-dialog-title', text: FAB_LABEL });

    var msg = el('textarea', {
      id: 'contact-msg', class: 'contact-field', rows: '4',
      'aria-label': 'Сообщение автору', placeholder: 'Ваше сообщение…'
    });

    var sendBtn = el('button', { type: 'button', class: 'contact-send' }, [document.createTextNode('Отправить')]);
    var status = el('div', { class: 'contact-status', 'aria-live': 'polite', role: 'status' });

    var form = el('div', { class: 'body' }, [
      el('ul', { class: 'contact-contacts' }, [
        el('li', {}, [el('a', { href: 'https://t.me/alxy_tg', target: '_blank', rel: 'noopener', text: 'Telegram: @alxy_tg' })]),
        el('li', {}, [el('a', { href: 'https://github.com/xsa-dev', target: '_blank', rel: 'noopener', text: 'GitHub: xsa-dev' })]),
        el('li', {}, [el('a', { href: 'mailto:' + email, text: 'Email: ' + email })])
      ]),
      el('label', { class: 'contact-label', for: 'contact-msg', text: 'Сообщение' }),
      msg,
      sendBtn,
      status
    ]);

    var header = el('header', {}, [title, closeBtn]);
    var dialog = el('div', {
      class: 'contact-modal', id: 'contact-dialog', role: 'dialog',
      'aria-modal': 'true', 'aria-labelledby': 'contact-dialog-title'
    }, [header, form]);

    var overlay = el('div', { class: 'contact-overlay' }, [dialog]);
    root.appendChild(fab);
    root.appendChild(overlay);

    var lastFocus = null;
    var focusables = [closeBtn, msg, sendBtn];

    function lockScroll(on) {
      document.documentElement.style.overflow = on ? 'hidden' : '';
      // Inert every direct child of <body> EXCEPT the modal nodes, so the
      // modal itself stays interactive even on pages without a <main> wrapper.
      Array.prototype.forEach.call(document.body.children, function (child) {
        if (child === fab || child === overlay) return;
        if (on) child.setAttribute('inert', '');
        else child.removeAttribute('inert');
      });
    }

    function open() {
      lastFocus = document.activeElement;
      overlay.classList.add('open');
      lockScroll(true);
      setTimeout(function () { closeBtn.focus(); }, 0);
    }
    function close() {
      overlay.classList.remove('open');
      lockScroll(false);
      status.textContent = ''; status.className = 'contact-status';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    fab.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') { // focus-trap
        var i = focusables.indexOf(document.activeElement);
        if (e.shiftKey && (i <= 0)) { e.preventDefault(); focusables[focusables.length - 1].focus(); }
        else if (!e.shiftKey && (i === focusables.length - 1)) { e.preventDefault(); focusables[0].focus(); }
      }
    });

    function sendMailto(text) {
      var subj = encodeURIComponent('Связь с автором — AI Disrupt PDLC');
      var body = encodeURIComponent(text);
      status.textContent = 'Открыт почтовый клиент. Если он не запустился — напишите на ' + email;
      status.className = 'contact-status ok';
      try {
        window.location.href = 'mailto:' + email + '?subject=' + subj + '&body=' + body;
      } catch (e) { /* navigation may be blocked in some hosts; status already set */ }
    }

    function fallback(text) {
      sendMailto(text);
    }

    sendBtn.addEventListener('click', function () {
      var text = msg.value.trim();
      if (!text) { status.textContent = 'Введите сообщение.'; status.className = 'contact-status err'; msg.focus(); return; }

      var ep = (root.getAttribute('data-contact-endpoint') || '').trim();
      if (ep && !/^https:\/\//i.test(ep)) ep = ''; // https-only, no creds

      if (!ep) { sendMailto(text); return; }

      status.textContent = 'Отправка…'; status.className = 'contact-status';
      fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: email, message: text, _subject: 'Связь с автором — AI Disrupt PDLC' }),
        credentials: 'omit'
      }).then(function (r) {
        if (r.ok) {
          status.textContent = 'Сообщение отправлено. Спасибо!'; status.className = 'contact-status ok';
          msg.value = '';
        } else {
          throw new Error('bad status ' + r.status);
        }
      }).catch(function () {
        fallback(text);
      });
    });
  }

  function init() {
    var root = document.body;
    if (!root || root.querySelector('.contact-fab')) return;
    buildModal(root);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
