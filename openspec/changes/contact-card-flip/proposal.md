# Proposal: Contact Author — flip-card business card

## Why
Текущий `contact-modal` (FAB «Связь с автором») открывает модалку с формой
отправки сообщения в Formspree. Это бьёт лимит подписки (50/mo) и выглядит
не как «визитка». Пользователь хочет красивую **flip-card визитку** в стиле
Apple Wallet: лицо — контакты на премиальной карте, рубашка — декоративный
фон с аватаром, по тапу/свайпу переворот. Форму отклика убираем совсем
(никакой отправки → Formspree не используется).

Это change модифицирует существующий capability **`contact-author`**
(REMOVED: форма + submission; MODIFIED: dialog → flip-card; ADDED: flip-логика,
front/back лица, запрет формы/сети).

## What Changes
Заменить модалку с формой на flip-card, инжектящийся тем же `contact-modal.js`
во все страницы (через `<body>`).

### Front (лицо) — Apple Wallet стиль
- Аватар в зелёном кольце + заголовок «Связь с автором» + подзаголовок «разработка сайта · xsa-dev»
- Контакты плашками (кликабельные): Telegram (@alxy_tg), GitHub (xsa-dev), Email (mailto)
- Подсказка «Нажмите, чтобы перевернуть»
- Размытый (боке) декоративный фон на всю карту, обрезанный по скруглённым углам, с полупрозрачной вуалью для читаемости

### Back (рубашка)
- Декоративный фон на всю карту: `web/contact-card-bg.svg` — чёрный «купол» из
  градиентных бусин-стрелок (teal→жёлтый→розовый), сгенерирован `gen_card_bg.py`
- Аватар из GitHub (`https://github.com/xsa-dev.png`) в рамке у верха; при ошибке — монограмма-плейсхолдер
- Вордмарк «AI Disrupt PDLC» + «Спасибо, что заглянули» на тёмных читаемых пилюлях

### Interaction
- FAB «Связь с автором» открывает карточку (centered overlay)
- Переворот: pointer-drag (tap + горизонтальный свайп, touch+mouse), плюс keyboard Enter/Space
- Клик по FAB/overlay/close/ESC → закрыть; фокус возвращается к триггеру

## Scope
`web/contact-modal.js` + `web/contact-modal.css` + новый ассет
`web/contact-card-bg.svg` (+ генератор `gen_card_bg.py`). Регистрация ассета в
`publish-policy.json` и `tests/test_publish_artifact.py`. Все страницы получают
изменение автоматически (общий скрипт). `data-contact-endpoint` больше не нужен.

## Non-Goals
- Не меняем футер курса (там уже email/GitHub/Telegram — см. replace-subscribe-with-links)
- Не добавляем отправку сообщений (форму убираем)
- Не меняем гейт курса

## Verification
- `contact-modal.js` НЕ содержит `formspree` / `contact-msg` / `contact-send` / `fetch`
- `contact-modal.css` содержит `.flip-front` / `.flip-back` / `.flipped` / `contact-card-bg`
- Headless-рендер front+back: боке на всю карту, углы скруглены, «AS» у верха не под X, тексты читаемы (vision)
- `web/contact-card-bg.svg` в `publish-policy.json` и `test_publish_artifact.py`; `pytest` зелёный
- `openspec validate contact-card-flip` → valid
