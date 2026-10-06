# Tasks: Unified Site Footer, Methodology Guide Link, and Attribution/Disclaimer

## Implementation
- [x] 1.1 Добавить общий CSS-стиль для `<footer data-site-footer>` (в `web/web-mobile.css` или `web/contact-modal.css`) с поддержкой mobile viewport, safe-area insets и контрастного текста.
- [x] 1.2 Добавить `<footer data-site-footer>` с прямой ссылкой на Whitepaper (`https://aipdlc.ru/documents/ru/whitepaper_full_ru.pdf`), разделением авторства (aipdlc.ru (Сбербанк) / xsa-dev) и текстом отказа от ответственности на страницы:
  - `web/diagnosis.html`
  - `web/roadmap.html`
  - `web/methodologies.html`
  - `web/antipatterns.html`
  - `web/openspec.html`
  - `web/course-openspec.html`
- [x] 1.3 Обновить `web/contact-modal.js` и `web/contact-modal.css`:
  - Добавить в список контактов/ссылок пункт «Руководство по генеративной разработке ПО (PDF) →».
  - На обороте карточки отобразить чёткую атрибуцию (Методология: aipdlc.ru (Сбербанк) / Разработка: xsa-dev) и краткий дисклеймер.
- [x] 1.4 Добавить автоматизированный тест `tests/test_web_footer_consistency.py` для проверки наличия `<footer data-site-footer>`, ссылки на Whitepaper, атрибуции и дисклеймера на всех 6 страницах.
- [x] 1.5 Обновить DOM-тесты `tests/contact_modal_dom.mjs` и CDP-тесты `tests/viewport_contact_modal.mjs` с учётом новой ссылки и атрибуции.

## Verification
- [x] 2.1 `openspec validate web-footer-disclaimer --type change` → valid.
- [x] 2.2 `python3 -m pytest tests/test_web_footer_consistency.py` → 6/6 passed.
- [x] 2.3 `node tests/contact_modal_dom.mjs` и `node tests/viewport_contact_modal.mjs` → passed.
- [x] 2.4 Скриншоты десктоп и мобильной версии модалки и футера через headless Chrome → проверка читаемости и верстки.
- [x] 2.5 Все существующие тесты (unittest, pytest, manifest) → green.

## Out of Scope
- Изменение навигационной шапки `<header data-site-header>`.
- Изменение логики калькуляторов и опросников.
