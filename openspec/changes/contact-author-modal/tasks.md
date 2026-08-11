## 1. Baseline
- [x] 1.1 Зафиксировать текущее состояние сайта (5 страниц, локальные vendor-ассеты, защищённая ветка master) перед добавлением модалки.
- [x] 1.2 Подтвердить, что сайт статичный и бэкенда нет → выбрать клиентский подход (mailto + опц. webhook POST-endpoint).

## 2. Implement Contact Modal (inline markup + 2 assets)
- [x] 2.1 Создать `web/contact-modal.css` с мобильными стилями оверлея/модалки, не зависящими от Tailwind CDN.
- [x] 2.2 Создать `web/contact-modal.js`: открытие/закрытие (триггер/ESC/overlay), focus-trap, background scroll-lock + `inert`/`aria-hidden` на контент, возврат фокуса к триггеру.
- [x] 2.3 Реализовать отправку: по умолчанию `mailto:` (нативный, офлайн); если задан `data-contact-endpoint` — `fetch` POST `application/json` с `Accept: application/json`, тело `{"email","message","_subject"}`, `credentials:'omit'`.
- [x] 2.4 Обработка webhook-ответа: при 2xx + `ok:true` → подтверждение; при сетевой ошибке/non-2xx → **fallback на `mailto:`**.
- [x] 2.5 Блок контактов (Telegram @alxy_tg, GitHub xsa-dev, email saleksey67@gmail.com) + текстовое поле + кнопка «Отправить»; валидация непустого сообщения.

## 3. Integrate Into All Pages (inline snippet)
- [x] 3.1 Подключить `contact-modal.css` + `contact-modal.js` (defer) и вставить инлайн-разметку модалки на `index.html`, `diagnosis.html`, `antipatterns.html`, `methodologies.html`, `roadmap.html` (отдельного `contact-modal.html` НЕ создаём).
- [x] 3.2 Триггер виден и доступен с клавиатуры на всех страницах, включая под project subpath.

## 4. Update Publication Gate
- [x] 4.1 Добавить `web/contact-modal.css` и `web/contact-modal.js` в `publish-policy.json` `allowed_web_files`.

## 5. Verify
- [x] 5.1 Локальный Chrome `--dump-dom` smoke: модалка рендерится со всеми контактами и `role=dialog aria-modal`.
- [x] 5.2 Webhook-тест (реальный POST на https://formspree.io/f/xgawanjd): возвращает `ok:true`; симуляция ошибки → fallback mailto.
- [x] 5.3 jsdom interaction: open/ESC/focus-trap/mailto/webhook/fallback — 12/12 passed.
- [x] 5.4 Существующие тесты (pytest + node suites + gate) — регрессий нет.

## 6. Publish
- [ ] 6.1 Создать PR в защищённую ветку `master`, пройти review + зелёный `test`-job.
- [ ] 6.2 Подтвердить live-доставку (HTTP 200 + модалка интерактивна на проде).
