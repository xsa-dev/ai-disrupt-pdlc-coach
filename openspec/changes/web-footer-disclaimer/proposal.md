# Proposal: Unified Site Footer, Methodology Guide Link, and Attribution/Disclaimer

## Why
1. Методология **AI-Disrupt PDLC** и «Руководство по генеративной разработке ПО» (Whitepaper v2.0) созданы **Алексеем Альвианским** ([aipdlc.ru](https://aipdlc.ru)).
2. Сайт **Disrupt PDLC Coach** (`ai-disrupt-pdlc-coach`) разработан **Алексеем Савиным (`xsa-dev`)** как независимый прикладной веб-инструмент (диагностика, roadmap, методики, антипаттерны, OpenSpec-курс).
3. Сейчас на части страниц (`methodologies.html`, `antipatterns.html`, `openspec.html`, `course-openspec.html`) и в модальном окне контактов отсутствует прямая ссылка на официальное «Руководство по генеративной разработке ПО →» (PDF).
4. На сайте отсутствует формализованный отказ от ответственности (дисклеймер) и явное разграничение авторства методологии и разработки сайта.

## What Changes
- Добавить единый семантический подвал `<footer data-site-footer>` на все 6 страниц сайта (`diagnosis.html`, `roadmap.html`, `methodologies.html`, `antipatterns.html`, `openspec.html`, `course-openspec.html`).
- В футере разместить:
  - Прямую ссылку на «Руководство по генеративной разработке ПО →» (`https://aipdlc.ru/documents/ru/whitepaper_full_ru.pdf`, `target="_blank"`, `rel="noopener"`).
  - Атрибуцию авторства: методология AI-Disrupt PDLC — Алексей Альвианский (`aipdlc.ru`), разработка сайта — `xsa-dev`.
  - Отказ от ответственности (дисклеймер): сайт является независимым образовательным и прикладным инструментом; материалы, результаты оценки зрелости и рекомендации носят исключительно информационно-ознакомительный характер; решения о внедрении практик принимаются с учётом индивидуального контекста команды и организации.
- В модальном окне (`contact-modal.js` + `contact-modal.css`):
  - Добавить интерактивную плашку со ссылкой на «Руководство по генеративной разработке ПО (PDF) →».
  - На обороте карточки зафиксировать явную атрибуцию (методология: Алексей Альвианский / разработка сайта: xsa-dev) и краткий дисклеймер.
- Добавить автоматизированные тесты консистентности футера на всех страницах (pytest) и регрессионные тесты модалки (jsdom + CDP).

## Scope
- `web/diagnosis.html`
- `web/roadmap.html`
- `web/methodologies.html`
- `web/antipatterns.html`
- `web/openspec.html`
- `web/course-openspec.html`
- `web/contact-modal.js`
- `web/contact-modal.css`
- `tests/test_web_header_consistency.py` (расширение на проверку футера или новый `tests/test_web_footer_consistency.py`)
- `tests/contact_modal_dom.mjs`

## Non-Goals
- Не меняем навигацию шапки `<header data-site-header>`.
- Не меняем бизнес-логику оценки L0–L5 / R0–R5 в `diagnosis.html`.
- Не изменяем структуру каталога методик и антипаттернов.

## Verification
- `openspec validate web-footer-disclaimer --type change` проходит успешно.
- Все 6 страниц содержат ссылку на руководство и дисклеймер.
- Модальное окно содержит ссылку на руководство и дисклеймер.
- Все тесты (pytest, jsdom, CDP, publish gate) зелёные.
