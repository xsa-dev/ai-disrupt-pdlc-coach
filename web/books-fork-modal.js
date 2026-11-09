/**
 * books-fork-modal.js - Unobtrusive methodology books fork component (PSLC & Vibe PPM)
 */
(function () {
  'use strict';

  if (typeof document === 'undefined' || !document.body) return;
  if (document.body.hasAttribute('data-books-fork-initialized')) return;
  document.body.setAttribute('data-books-fork-initialized', 'true');

  var lastActiveElement = null;
  var inertElements = [];

  // Create floating chip trigger
  var chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'books-fork__chip';
  chip.setAttribute('data-books-fork-trigger', '');
  chip.setAttribute('aria-haspopup', 'dialog');
  chip.setAttribute('aria-controls', 'books-fork-dialog');
  chip.setAttribute('aria-expanded', 'false');
  chip.setAttribute('aria-label', 'Развилка методологии: книги PSLC и Vibe PPM');
  chip.innerHTML = '<span class="books-fork__pulse" aria-hidden="true"></span>' +
    '<span class="books-fork__label-full">🧭 Развилка: PSLC ← | → Vibe PPM</span>' +
    '<span class="books-fork__label-short">🧭 Развилка</span>';
  document.body.appendChild(chip);

  // Create modal overlay & dialog markup
  var overlay = document.createElement('div');
  overlay.className = 'books-fork__overlay';
  overlay.id = 'books-fork-overlay';
  overlay.hidden = true;

  overlay.innerHTML =
    '<div class="books-fork__dialog" id="books-fork-dialog" role="dialog" aria-modal="true" aria-labelledby="books-fork-title" aria-describedby="books-fork-desc">' +
      '<button type="button" class="books-fork__close" id="books-fork-close" aria-label="Закрыть">×</button>' +
      '<div class="books-fork__header">' +
        '<span class="books-fork__badge">🧭 РАЗВИЛКА AI-DISRUPT</span>' +
        '<h2 class="books-fork__title" id="books-fork-title">Куда двигаться дальше?</h2>' +
        '<p class="books-fork__desc" id="books-fork-desc">Базовое Руководство PDLC задаёт фундамент. Выберите специализированный трек под вашу роль:</p>' +
      '</div>' +
      '<div class="books-fork__grid">' +
        '<a href="https://aipdlc.ru/ru/pslc" target="_blank" rel="noopener" class="books-fork__card books-fork__card--pslc">' +
          '<div>' +
            '<span class="books-fork__card-tag books-fork__card-tag--pslc">← Эксплуатация ПО</span>' +
            '<h3 class="books-fork__card-title">AI-Disrupt PSLC</h3>' +
            '<p class="books-fork__card-text">Product Service Lifecycle: жизненный цикл эксплуатации и сопровождения ПО, надёжность сервисов и совместная работа людей и ИИ-агентов.</p>' +
          '</div>' +
          '<div class="books-fork__card-action books-fork__card-action--pslc">' +
            '<span>Изучить PSLC ←</span>' +
            '<span aria-hidden="true">↗</span>' +
          '</div>' +
        '</a>' +
        '<a href="https://aipdlc.ru/ru/vibeppm" target="_blank" rel="noopener" class="books-fork__card books-fork__card--vibe">' +
          '<div>' +
            '<span class="books-fork__card-tag books-fork__card-tag--vibe">Продуктовый трек →</span>' +
            '<h3 class="books-fork__card-title">Vibe PPM</h3>' +
            '<p class="books-fork__card-text">Portfolio & Project Management: продуктовый вайб-кодинг, управление скоростью проверки гипотез и метрики зрелости распределенных портфелей.</p>' +
          '</div>' +
          '<div class="books-fork__card-action books-fork__card-action--vibe">' +
            '<span>Открыть Vibe PPM →</span>' +
            '<span aria-hidden="true">↗</span>' +
          '</div>' +
        '</a>' +
      '</div>' +
      '<div class="books-fork__bridge">' +
        'Базовый первоисточник: <a href="https://aipdlc.ru/documents/ru/whitepaper_full_ru.pdf" target="_blank" rel="noopener">Руководство по генеративной разработке ПО (Белая книга) →</a>' +
      '</div>' +
      '<div class="books-fork__footer">' +
        'Автор концепции AI-Disrupt: Кирилл Меньшов • Правообладатель: <a href="https://aipdlc.ru/ru/" target="_blank" rel="noopener"><strong>ПАО Сбербанк</strong></a> • Независимый образовательный инструмент. Материалы цитируются в учебных целях (ст. 1274 ГК РФ) в соответствии с <a href="https://aipdlc.ru/ru/legal-info" target="_blank" rel="noopener">правилами использования материалов</a>.' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  var dialog = overlay.querySelector('#books-fork-dialog');
  var closeBtn = overlay.querySelector('#books-fork-close');

  function getFocusableElements() {
    return Array.prototype.slice.call(
      dialog.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
    );
  }

  function setTriggersExpanded(state) {
    var triggers = document.querySelectorAll('[data-books-fork-trigger]');
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].setAttribute('aria-expanded', state ? 'true' : 'false');
    }
  }

  function openModal(triggerElement) {
    lastActiveElement = triggerElement || document.activeElement;
    overlay.hidden = false;
    setTriggersExpanded(true);
    document.documentElement.style.overflow = 'hidden';

    // Apply inert to other top-level elements
    inertElements = [];
    var children = document.body.children;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child !== overlay && child !== chip && !child.hasAttribute('inert')) {
        child.setAttribute('inert', '');
        inertElements.push(child);
      }
    }

    // Set initial focus
    var focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      closeBtn.focus();
    }
  }

  function closeModal() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    setTriggersExpanded(false);
    document.documentElement.style.overflow = '';

    // Remove inert
    for (var i = 0; i < inertElements.length; i++) {
      inertElements[i].removeAttribute('inert');
    }
    inertElements = [];

    // Restore focus
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      try {
        lastActiveElement.focus();
      } catch (err) {}
    }
  }

  // Close handlers
  closeBtn.addEventListener('click', function (e) {
    e.preventDefault();
    closeModal();
  });

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) {
      closeModal();
    }
  });

  // Focus trap and Escape key listener
  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) return;

    if (e.key === 'Escape' || e.keyCode === 27) {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key === 'Tab' || e.keyCode === 9) {
      var focusable = getFocusableElements();
      if (focusable.length === 0) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });

  // Unified event delegation for any fork triggers (chip or footer)
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-books-fork-trigger]');
    if (trigger) {
      e.preventDefault();
      openModal(trigger);
    }
  });

})();
