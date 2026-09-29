/* Contact Author — flip-card business card. No dependencies, vanilla JS.
 * Replaces the old message-form modal. Opens an Apple Wallet–style flip-card:
 *   front = contacts (Telegram / GitHub / Email) over a blurred bokeh backdrop
 *   back  = decorative dome background (contact-card-bg.svg) + framed avatar
 * Tap or drag/swipe the card to flip. No message form, no network POST.
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

  function buildCard(root) {
    var email = root.getAttribute('data-contact-email') || EMAIL;

    var fab = el('button', {
      type: 'button', class: 'contact-fab', 'aria-haspopup': 'dialog',
      'aria-controls': 'contact-card'
    }, [document.createTextNode('✉ ' + FAB_LABEL)]);

    var closeBtn = el('button', { type: 'button', class: 'contact-close', 'aria-label': 'Закрыть' }, [document.createTextNode('×')]);

    // Front face: Apple Wallet–style business card
    var frontAvatar = el('img', {
      class: 'card-avatar', src: 'https://github.com/xsa-dev.png',
      alt: 'Аватар автора',
      onerror: "this.style.display='none';this.parentNode.classList.add('avatar-fallback');"
    });
    var front = el('div', { class: 'flip-front' }, [
      el('div', { class: 'card-sheen' }, []),
      el('div', { class: 'front-header' }, [
        el('div', { class: 'avatar-ring' }, [frontAvatar]),
        el('div', { class: 'front-id' }, [
          el('h2', { id: 'contact-card-title', text: FAB_LABEL }),
          el('p', { class: 'card-role', text: 'разработка сайта · xsa-dev' })
        ])
      ]),
      el('ul', { class: 'contact-contacts' }, [
        el('li', {}, [el('a', { href: 'https://aipdlc.ru/documents/ru/whitepaper_full_ru.pdf', target: '_blank', rel: 'noopener' }, [
          el('span', { class: 'c-badge c-badge--guide', 'aria-hidden': 'true', text: '📖' }),
          el('span', { class: 'c-label' }, [
            el('span', { class: 'c-kind', text: 'Руководство' }),
            el('span', { class: 'c-value', text: 'Whitepaper PDLC (PDF)' })
          ])
        ])]),
        el('li', {}, [el('a', { href: 'https://t.me/alxy_tg', target: '_blank', rel: 'noopener' }, [
          el('span', { class: 'c-badge', 'aria-hidden': 'true', text: '✈' }),
          el('span', { class: 'c-label' }, [
            el('span', { class: 'c-kind', text: 'Telegram' }),
            el('span', { class: 'c-value', text: '@alxy_tg' })
          ])
        ])]),
        el('li', {}, [el('a', { href: 'https://github.com/xsa-dev', target: '_blank', rel: 'noopener' }, [
          el('span', { class: 'c-badge', 'aria-hidden': 'true', text: '⑂' }),
          el('span', { class: 'c-label' }, [
            el('span', { class: 'c-kind', text: 'GitHub' }),
            el('span', { class: 'c-value', text: 'xsa-dev' })
          ])
        ])]),
        el('li', {}, [el('a', { href: 'mailto:' + email }, [
          el('span', { class: 'c-badge', 'aria-hidden': 'true', text: '✉' }),
          el('span', { class: 'c-label' }, [
            el('span', { class: 'c-kind', text: 'Email' }),
            el('span', { class: 'c-value', text: email })
          ])
        ])])
      ]),
      el('p', { class: 'flip-hint', text: 'Нажмите, чтобы перевернуть' })
    ]);

    // Back face: emerald pass back with framed avatar, attribution, and disclaimer
    var backAvatar = el('img', {
      class: 'back-avatar', src: 'https://github.com/xsa-dev.png',
      alt: 'Аватар автора',
      onerror: "this.style.display='none';this.parentNode.classList.add('avatar-fallback');"
    });
    var back = el('div', { class: 'flip-back' }, [
      el('div', { class: 'card-sheen' }, []),
      el('div', { class: 'back-frame' }, [backAvatar]),
      el('p', { class: 'back-name', text: 'AI Disrupt PDLC Coach' }),
      el('div', { class: 'back-attribution' }, [
        el('div', { class: 'back-attr-line', text: 'Методология: Алексей Альвианский (aipdlc.ru)' }),
        el('div', { class: 'back-attr-line', text: 'Разработка сайта: xsa-dev' })
      ]),
      el('p', { class: 'back-disclaimer', text: 'Отказ от ответственности: независимый образовательный инструмент. Оценки носят ознакомительный характер.' }),
      el('p', { class: 'flip-hint', text: 'Спасибо, что заглянули' })
    ]);

    var inner = el('div', { class: 'flip-card-inner' }, [front, back]);
    var card = el('div', {
      class: 'flip-card', id: 'contact-card', role: 'dialog',
      'aria-modal': 'true', 'aria-labelledby': 'contact-card-title',
      tabindex: '0'
    }, [closeBtn, inner]);

    var overlay = el('div', { class: 'contact-overlay' }, [card]);
    root.appendChild(fab);
    root.appendChild(overlay);

    var lastFocus = null;

    function lockScroll(on) {
      document.documentElement.style.overflow = on ? 'hidden' : '';
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
      card.classList.remove('flipped');
      setTimeout(function () { card.focus(); }, 0);
    }
    function close() {
      overlay.classList.remove('open');
      lockScroll(false);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function flip() { card.classList.toggle('flipped'); }

    fab.addEventListener('click', open);
    closeBtn.addEventListener('click', close);

    // Tap to flip (ignore links), plus finger/mouse drag-to-flip for tactile feel
    var dragX = 0, dragY = 0, dragging = false, moved = false;
    card.addEventListener('pointerdown', function (e) {
      if (e.target.tagName === 'A') return;
      dragging = true; moved = false;
      dragX = e.clientX; dragY = e.clientY;
    });
    card.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      if (Math.abs(e.clientX - dragX) > 10 || Math.abs(e.clientY - dragY) > 10) moved = true;
    });
    card.addEventListener('pointerup', function (e) {
      if (!dragging) return;
      dragging = false;
      if (e.target.tagName === 'A') return;
      var dx = e.clientX - dragX, dy = e.clientY - dragY;
      // horizontal swipe past threshold -> flip; small movement (tap) -> also flip
      if (Math.abs(dx) > 40 || !moved) flip();
    });
    card.addEventListener('pointercancel', function () { dragging = false; });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
    });
  }

  function init() {
    var root = document.body;
    if (!root || root.querySelector('.contact-fab')) return;
    buildCard(root);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
