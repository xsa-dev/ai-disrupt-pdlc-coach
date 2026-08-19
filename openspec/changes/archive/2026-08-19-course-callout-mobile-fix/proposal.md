# Proposal: Fix mobile callout/inline-code breakage (course-callout-mobile-fix)

## Why
Пользователь прислал скриншот мобильной версии курса (390px): блок «Как начать:»
в модуле 6 рендерился нечитаемо — команды вроде `/opsx:explore` разбивались
посимвольно в вертикальные столбцы (`/o`, `ps`, `x:` ...).

Корень: в `styles.css` + дизайн-системе скилла `.callout` имеет `display: flex`,
а инлайн-`<code>` внутри него становился flex-child и сжимался до ~10px ширины;
`white-space: pre-wrap` + `word-break: break-word` ломали длинные команды
посимвольно на узких экранах.

## What Changes
- `web/course-openspec.html` (inline `<style>`): инлайн-код возвращён к
  `display: inline` с `white-space: normal` (через `code:not(pre code):not(.bug-line code):not(.code-line)`),
  и `.callout` переопределён на `display: block`, чтобы `<code>` не сжимался flex-ом.

## Impact
- Только CSS-переопределение в инлайн-`<style>` курса. `styles.css` скилла не тронут.
- Code-блоки (`.translation-code pre code`, `.bug-line code`) исключены из правила.
- Риск: минимальный.
