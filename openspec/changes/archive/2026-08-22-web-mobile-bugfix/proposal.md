# Proposal: Mobile UI Bugfixes (post in-app audit)

## Why
После выкатки `web-mobile-inapp` (safe-area/dvh) пришли скриншоты реальных
in-app браузеров (iOS Safari/Telegram/Threads). Найдены 2 бага мобильной
вёрстки, которые safe-area не лечит:

1. **Nav пункты склеены** — `ДиагностикаRoadmapМетодикиАнтипаттерныOpenSpecКурс`,
   нет видимого отступа; `OpenSpecКурс` обрезан у края. Tailwind `gap-x-2`
   в flex не применился в WebView.
2. **Текст вылезает из кнопки** — в курсе «Следующий шаг ▸» переносится на 2
   строки внутри кнопки; «2 / 5 messages» прижат к «Сбросить».

## What Changes
- Добавить явный `padding-right` + `flex-shrink:0` к `.site-nav-link`
  (в `web-mobile.css`, поверх Tailwind gap).
- Добавить `white-space:nowrap; flex-shrink:0` к `.btn` и чат-кнопкам курса.

## Scope
Только CSS-правки в `web/web-mobile.css`. Затрагивает отображение nav и
кнопок на всех страницах.

## Non-Goals
- Не меняем структуру nav (только отступы).
- Не меняем логику квизов/диагностики.
- Не трогаем safe-area/dvh (это web-mobile-inapp, уже в prod).
- spellcheck не является багом (подтверждено пользователем) — не правим.

## Verification
- Навигация: пункты разделены отступом, не склеены, не обрезаны.
- Кнопка «Следующий шаг» — текст в одну строку, не переносится.
- `openspec validate web-mobile-bugfix`.
