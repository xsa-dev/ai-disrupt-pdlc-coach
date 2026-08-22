# Proposal: Replace newsletter subscription with static links

## Why
Formspree (endpoint `xgawanjd`, plan 50 submissions/month) достиг 90% лимита.
Основной источник отправок — форма подписки на рассылку (`newsletter-cta`
в модуле 6 + `course-footer-subscribe-btn` в футере), которая шлёт в тот же
Formspree endpoint, что и contact-modal.

Пользователь решил: **убрать форму подписки**, но **оставить** возможность
связаться — email, GitHub и переход в Telegram с текстом приветствия.

## What Changes
- Удалить `newsletter-cta` (модуль 6) и `course-footer-subscribe-btn` (футер).
- В футере оставить/добавить статические ссылки:
  - **Email** — `mailto:saleksey67@gmail.com` (или кнопка contact-modal «Связь с автором»)
  - **GitHub** — репозиторий сайта + официальный OpenSpec (уже есть)
  - **Telegram** — `https://t.me/alxy_tg?text=Привет, хочу узнать про OpenSpec` (переход с приветствием)

## Scope
Только `web/course-openspec.html` (удаление блоков подписки + добавление
Telegram-ссылки в футер). Contact-modal (связь с автором) НЕ трогаем.

## Non-Goals
- Не меняем contact-modal (он нужен для связи, шлёт в Formspree, но
  используется редко — не основной источник лимита).
- Не трогаем гейт доступа (course-gamification).

## Verification
- `course-openspec.html` не содержит `course-newsletter-btn` / `course-footer-subscribe-btn`.
- Футер содержит email + GitHub + Telegram (с текстом приветствия) ссылки.
- `openspec validate replace-subscribe-with-links`.
