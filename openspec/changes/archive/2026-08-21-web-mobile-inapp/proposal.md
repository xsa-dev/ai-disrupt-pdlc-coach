# Proposal: Mobile & In-App Browser Adaptation (Threads, Telegram)

## Why
Сайт открывается из лент соцсетей (Threads, Telegram) в **in-app браузерах**
(WebKit/VK WebView, Telegram WebView). Они отличаются от десктопа и Safari:
- есть верхний тулбар приложения и нижний «домой»-индикатор (safe-area);
- `100vh` считает высоту ВКЛЮЧАЯ тулбары → футеры/модалки обрезаются;
- `position: fixed` элементы (модалка контакта, липкая навигация) перекрываются
  системными барами;
- tap-targets меньше 44px → неудобно тыкать;
- нет hover, возможен disabled JS-анимаций.

Сейчас `viewport` стоит без `viewport-fit=cover`, нет `env(safe-area-inset-*)`,
нет `100dvh`. Нужна адаптация под in-app браузеры без потери десктопа.

## What Changes
- Добавить `viewport-fit=cover` и safe-area поля ко всем страницам.
- Заменить `100vh` на `100dvh` (+ fallback) в полноэкранных блоках.
- Отодвинуть `position: fixed` элементы на `env(safe-area-inset-*)` + `dvh`.
- Минимум 44px tap-targets для навигации/кнопок.
- Отключить hover-only интерактив (сделать доступным по tap/click).

## Scope
Только CSS/layout/meta — без изменения контента или функционала страниц.
Затрагивает `web/`, `web/course-openspec/styles.css`, `web/contact-modal.css`.

## Non-Goals
- Не меняем контент/тексты страниц.
- Не делаем отдельную мобильную версию (responsive, не separate).
- Не трогаем логику геймификации курса (это отдельный change).

## Verification
- `curl` всех 7 страниц: viewport содержит `viewport-fit=cover`.
- `grep 100dvh` в CSS; `env(safe-area-inset` присутствует.
- Визуальная проверка в Telegram in-app WebView (iPhone SE ширина 375px):
  модалка контакта не обрезается, футер виден, навигация кликабельна.
