# Tasks: web-glossary-multilingual

## Implementation
- [x] 1.1 Создать `web/glossary-data.js` с набором терминов AI-Disrupt PDLC (двуязычные названия, определения, контекст, категории, теги, алиасы).
- [x] 1.2 Создать `web/glossary.html` с поддержкой:
  - Единого хедера `data-site-header` со всеми 7 пунктами навигации и активным состоянием для «Глоссарий».
  - Полнотекстового поиска с подсветкой совпадений и индикатором количества.
  - Переключателя языка (RU / EN) с сохранением в `localStorage`.
  - Закладок (добавление, удаление, сохранение в `localStorage`, фильтр «Только закладки»).
  - Фильтров по категориям/тегам.
  - Пермалинков `#term-<id>` и копирования ссылки на термин.
  - Единого подвала `data-site-footer`.
- [x] 1.3 Обновить хедер во всех остальных 6 страницах (`diagnosis.html`, `roadmap.html`, `methodologies.html`, `antipatterns.html`, `openspec.html`, `course-openspec.html`), добавив ссылку «Глоссарий».
- [x] 1.4 Зарегистрировать `web/glossary.html` и `web/glossary-data.js` в `publish-policy.json`.
- [x] 1.5 Обновить `tests/test_publish_artifact.py` с новыми файлами в `allowed_web_files`.
- [x] 1.6 Обновить тесты консистентности хедера и футера:
  - `tests/test_web_header_consistency.py`
  - `tests/viewport_headers.mjs`
  - `tests/test_web_footer_consistency.py`
- [x] 1.7 Создать `tests/glossary_dom.mjs` для тестирования логики поиска, переключения языков и закладок в jsdom.

## Verification
- [x] 2.1 Запустить `openspec validate web-glossary-multilingual --strict`.
- [x] 2.2 Прогнать полный набор тестов pytest и node:
  - `python3 -m unittest tests.test_publish_artifact tests.test_publish_gate tests.test_publication_wrapper tests.test_pages_workflow tests.test_web_index -v`
  - `pytest tests/test_web_header_consistency.py tests/test_web_methodologies.py tests/test_web_footer_consistency.py`
  - `node tests/viewport_headers.mjs`
  - `node tests/glossary_dom.mjs`
  - `node tests/headless_methodologies.mjs`
  - `node tests/quiz_v1_*.mjs`
  - `node tests/contact_modal_dom.mjs`
  - `node tests/viewport_contact_modal.mjs`
- [x] 2.3 Создать PR, проверить прохождение CI-чеков GitHub Actions.
- [x] 2.4 Смёржить PR, дождаться GitHub Pages deploy и верифицировать live HTTP 200.
