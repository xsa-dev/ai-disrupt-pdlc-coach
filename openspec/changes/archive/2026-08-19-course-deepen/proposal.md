# Proposal: Deepen the OpenSpec course (course-deepen)

## Why
Курс по OpenSpec опубликован и прошёл ревью (change `course-ui-polish`,
archived 2026-08-19). Пользователь дал три новых предложения по развитию:

1. **Darcula для code-блоков.** Сейчас блоки кода в курсе используют тёмный
   фон дизайн-системы скилла (`--color-bg-code: #1E1E2E`) без подсветки
   синтаксиса. Хочется применить палитру **Darcula** (IntelliJ) и добавить
   syntax-highlighting, чтобы код читался легче.
2. **Продлить курс.** Добавить модули, углубляющие практику: что реально
   происходит при archive, и как писать хорошие сценарии (GIVEN/WHEN/THEN).
3. **Больше интерактива и квизов** для глубокого вникания в тему.

## What Changes
- `web/course-openspec.html` (inline `<style>`): переопределить
  `--color-bg-code` на Darcula `#282a36`; добавить классы syntax-highlight
  (`.code-keyword`, `.code-string`, `.code-comment`, `.code-num`,
  `.code-punc`) с Darcula-цветами; применить их к существующим `<code>`
  блокам.
- `web/course-openspec.html`: добавить модуль 7 «Архив на практике» и
  модуль 8 «Пиши хорошие scenarios», каждый с теорией + квизом.
- `web/course-openspec.html`: добавить ещё один квиз в модуль 3 (delta-спеки)
  для закрепления.

## Impact
- Только фронтенд курса. Нет бэкенда, нет новых файлов, `publish-policy.json`
  не меняется.
- Риск: низкий (только CSS + HTML-контент). Существующие интерактивы
  (quiz/chat/flow/glossary/spot-bug) не затрагиваются.
- Новые модули должны пройти тот же header-contract (у курса свой site-header,
  уже в контракте).
