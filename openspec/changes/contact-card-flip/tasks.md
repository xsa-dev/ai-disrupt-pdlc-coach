# Tasks: Contact Author flip-card business card

## Implementation
- [x] 1.1 `contact-modal.js`: заменить модалку с формой на flip-card (FAB + overlay + card с front/back). Модифицирует `contact-author` capability.
- [x] 1.2 Front (Apple Wallet стиль): аватар в кольце + заголовок «Связь с автором» + подзаголовок «разработка сайта · xsa-dev» + Telegram/GitHub/Email плашки-ссылки + подсказка «Нажмите, чтобы перевернуть»
- [x] 1.3 Back: `<img src="https://github.com/xsa-dev.png" onerror=monogram>` в рамке у верха + вордмарк «AI Disrupt PDLC» + «Спасибо, что заглянули» на тёмных пилюлях
- [x] 1.4 Flip: pointer-drag (tap + горизонтальный свайп, touch+mouse) toggle `.flipped`; keyboard (Enter/Space) тоже
- [x] 1.5 Убрать formspree / textarea / contact-send / contact-newsletter / fetch POST из JS
- [x] 1.6 `contact-modal.css`: `.flip-front`/`.flip-back` через display, боке-фон на всю карту (clip по radius), декоративный купол `contact-card-bg.svg` на обороте, читаемые пилюли
- [x] 1.7 FAB открывает карточку (overlay centered), close/overlay/ESC закрывают; фокус возвращается к триггеру
- [x] 1.8 Добавить `web/contact-card-bg.svg` (генератор `gen_card_bg.py`); зарегистрировать в `publish-policy.json` + `tests/test_publish_artifact.py`

## Verification
- [x] 2.1 grep 'formspree|contact-msg|contact-send|fetch' в contact-modal.js → 0
- [x] 2.2 grep 'flip-front|flip-back|flipped|contact-card-bg' в contact-modal.css → присутствуют
- [x] 2.3 Headless-рендер (front+back): боке на всю карту, углы скруглены, «AS» у верха не под X, тексты читаемы — vision подтвердил
- [x] 2.4 `openspec validate contact-card-flip` → valid
- [x] 2.5 `pytest tests/test_publish_artifact.py` → SVG в манифесте, зелёный

## Out of scope
- [ ] Футер курса (уже есть email/GitHub/Telegram — replace-subscribe-with-links)
- [ ] Гейт курса
- [ ] Отправка сообщений (убрана)
