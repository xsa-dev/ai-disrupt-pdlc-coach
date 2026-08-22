/* web/course-gate.js — behavioral gate для курса OpenSpec
 *
 * Логика (вариант 3, выбран пользователем): курс скрыт, открывается ТОЛЬКО если
 * (а) проведено >= 20с на openspec.html ПРИ видимом табе (visibility API)
 * И (б) нажата кнопка «Мне интересно».
 * Без бэкенда: localStorage (try/catch) + in-session fallback для WebView.
 */
(function () {
  "use strict";
  var MIN_SECONDS = 20;
  var KEY = "courseAccess";
  var UNLOCKED = "unlocked";

  // --- storage с try/catch (WebView может блокировать localStorage) ---
  var sessionUnlocked = false;
  function readUnlocked() {
    try {
      if (sessionUnlocked) return true;
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(KEY) === UNLOCKED;
      }
    } catch (e) { /* storage disabled */ }
    return sessionUnlocked;
  }
  function setUnlocked() {
    sessionUnlocked = true;
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(KEY, UNLOCKED);
      }
    } catch (e) { /* storage disabled — in-session фолбэк уже выставлен */ }
  }

  function isCoursePage() {
    return /course-openspec\.html($|\?|#)/.test(window.location.pathname + window.location.search);
  }
  function isOpenSpecPage() {
    return /openspec\.html($|\?|#)/.test(window.location.pathname + window.location.search);
  }

  // --- Анимация разблокировки ---
  function playUnlockAnimation(done) {
    var overlay = document.createElement("div");
    overlay.setAttribute("data-unlock-anim", "");
    overlay.innerHTML =
      '<div class="unlock-seal">🔓</div>' +
      '<div class="unlock-text">Курс открыт</div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function () {
      overlay.classList.add("unlock-anim--show");
    });
    setTimeout(function () {
      overlay.classList.add("unlock-anim--done");
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (typeof done === "function") done();
      }, 450);
    }, 900);
  }

  // ============ openspec.html: накопление времени + interest-сигнал ============
  function initOpenSpecPage() {
    var elapsed = 0;        // секунд видимого времени
    var ticker = null;
    var interested = false; // нажата ли «Мне интересно»

    function startTicker() {
      if (ticker) return;
      ticker = setInterval(function () {
        if (document.visibilityState === "visible") elapsed += 1;
        updateHint();
      }, 1000);
    }
    function stopTicker() {
      if (ticker) { clearInterval(ticker); ticker = null; }
    }
    function timeReady() { return elapsed >= MIN_SECONDS; }

    var hint = null;
    function updateHint() {
      if (!hint) return;
      if (readUnlocked()) { hint.textContent = "Курс доступен ✅"; return; }
      var left = Math.max(0, MIN_SECONDS - elapsed);
      hint.textContent = timeReady()
        ? 'Нажмите «Мне интересно», чтобы открыть курс'
        : "Осталось " + left + "с на странице, чтобы открыть курс";
    }

    function unlock() {
      setUnlocked();
      // разблокировать ссылки
      var links = document.querySelectorAll('a[href="course-openspec.html"]');
      links.forEach(function (a) {
        a.classList.remove("course-link--locked");
        a.removeAttribute("data-locked");
      });
      if (hint) hint.textContent = "Курс доступен ✅";
      playUnlockAnimation(function () {
        // после анимации — плавный переход
        window.location.href = "course-openspec.html";
      });
    }

    function wireInterestButton(btn) {
      if (!btn) return;
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        if (readUnlocked()) { window.location.href = "course-openspec.html"; return; }
        if (!timeReady()) {
          if (hint) {
            hint.textContent = "Ещё рано — проведите 20с на странице OpenSpec";
            hint.classList.add("course-hint--warn");
          }
          return; // early click игнорируется
        }
        interested = true;
        unlock();
      });
    }

    function wireLockedLinks() {
      var links = document.querySelectorAll('a[href="course-openspec.html"]');
      links.forEach(function (a) {
        if (readUnlocked()) { a.classList.remove("course-link--locked"); return; }
        a.classList.add("course-link--locked");
        a.setAttribute("data-locked", "1");
        a.addEventListener("click", function (e) {
          if (readUnlocked()) return; // уже открыто
          e.preventDefault();
          if (hint) {
            hint.textContent = timeReady()
              ? 'Нажмите «Мне интересно», чтобы открыть курс'
              : "Сначала проведите 20с на странице OpenSpec";
            hint.classList.add("course-hint--warn");
          }
        });
      });
    }

    var interestBtn = document.querySelector('[data-course-interest]');
    hint = document.querySelector('[data-course-hint]');
    wireInterestButton(interestBtn);
    wireLockedLinks();
    if (hint) updateHint();

    // visibility-based таймер
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") startTicker();
      else stopTicker();
    });
    if (document.visibilityState === "visible") startTicker();
  }

  // ============ course-openspec.html: locked-экран при прямом заходе ============
  function initCoursePage() {
    if (readUnlocked()) return; // открыто — показываем курс как есть
    // показать locked-overlay, скрыть контент
    var body = document.body;
    body.classList.add("course-locked");
    var overlay = document.createElement("div");
    overlay.setAttribute("data-course-locked-screen", "");
    overlay.innerHTML =
      '<div class="course-locked__card">' +
      '<div class="course-locked__icon">🔒</div>' +
      '<h1 class="course-locked__title">Курс закрыт</h1>' +
      '<p class="course-locked__text">Курс открывается для тех, кто заинтересован в OpenSpec. ' +
      'Вернитесь в раздел OpenSpec, проведите там 20 секунд и нажмите «Мне интересно».</p>' +
      '<a class="course-locked__cta" href="openspec.html">Вернуться к OpenSpec →</a>' +
      '</div>';
    body.appendChild(overlay);
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (isCoursePage()) initCoursePage();
    else if (isOpenSpecPage()) initOpenSpecPage();
  });
})();
