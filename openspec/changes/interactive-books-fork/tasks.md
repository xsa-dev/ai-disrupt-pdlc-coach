# Tasks: Unobtrusive Interactive Books Fork (PSLC & Vibe PPM)

## 1. Спецификации и Контроль качества (Pre-implementation)
- [x] 1.1 Создать спецификацию возможности `specs/books-fork/spec.md` с полным контрактом компонента.
- [x] 1.2 Создать дельта-спецификацию `specs/web-shell/spec.md` с требованием интеграции развилки на всех страницах.
- [x] 1.3 Выполнить строгую валидацию изменения `openspec validate interactive-books-fork --strict`.
- [x] 1.4 Запустить пул из 6 независимых субагентов для пре-ревью на GO / NOT-GO перед реализацией и устранить все P0/P1 замечания.
- [x] 1.5 Получить подтверждение пользователя на применение изменения.

## 2. Реализация компонента и интеграция
- [x] 2.1 Разработать модуль `web/books-fork-modal.js` с плавающим чипом, разметкой модального окна, ссылками на PSLC/Vibe PPM, юридической атрибуцией, WAI-ARIA атрибутами, Focus Trap и фокус-менеджментом.
- [x] 2.2 Разработать стили `web/books-fork-modal.css` с мобильной адаптивностью (коллапс лейбла на <640px, safe-area insets, 44px tap targets, glassmorphism, z-index координация `1000` / `2147483001`).
- [x] 2.3 Подключить компонент развилки на все 8 страниц сайта (`diagnosis.html`, `roadmap.html`, `methodologies.html`, `antipatterns.html`, `openspec.html`, `course-openspec.html`, `glossary.html`, `index.html`).
- [x] 2.4 Добавить дополнительный триггер развилки в сквозной подвал (`site-footer__guide`) на 7 контентных страницах.

## 3. Автоматизированное тестирование и CI/CD
- [x] 3.1 Создать тест DOM и контракта `tests/books_fork_dom.mjs` (проверка триггеров на 8 страницах, футерного триггера на 7 страницах, валидности ссылок PSLC/Vibe PPM/Whitepaper/legal-info, атрибуции ПАО Сбербанк / Кирилл Меньшов, a11y, Focus Trap, Esc-хэндлера).
- [x] 3.2 Зарегистрировать новые файлы `books-fork-modal.js` и `books-fork-modal.css` в `publish-policy.json` и `tests/test_publish_artifact.py`.
- [x] 3.3 Обновить `tests/test_web_footer_consistency.py` проверкой наличия комплементарного триггера развилки в `.site-footer__guide`.
- [x] 3.4 Зарегистрировать запуск `tests/books_fork_dom.mjs` в `.github/workflows/pages.yml`.
- [x] 3.5 Прогнать весь локальный тестовый стек: Pytest (51+ тестов), JSDOM тесты, Viewport CDP тесты (390px, 744px, 1200px).

## 4. Деплой, Live-верификация и Архивация
- [ ] 4.1 Создать ветку `feat/interactive-books-fork`, оформить коммит и запушить в GitHub.
- [ ] 4.2 Открыть PR, дождаться прохождения CI и выполнить squash-мёрдж в `master`.
- [ ] 4.3 Дождаться деплоя на GitHub Pages и выполнить live-проверку HTTP 200, DOM и скриншотов на проде.
- [ ] 4.4 Провести финальное субагентское ревью на архивацию, запросить подтверждение пользователя и заархивировать изменение.
