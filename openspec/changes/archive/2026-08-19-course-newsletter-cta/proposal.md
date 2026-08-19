# Proposal: Newsletter opt-in via contact modal + course CTA (course-newsletter-cta)

## Why
Курс по OpenSpec — хорошая воронка для подписки: читатель только что вник в
тему. Нужно дать ему лёгкий путь подписаться на рассылку прямо в конце курса.

Чтобы не плодить отдельные формы/эндпоинты, используем существующую
Formspree-модалку контактов (`web/contact-modal.js`, endpoint
`https://formspree.io/f/xgawanjd`, уже публичный и верифицированный):
добавляем в неё **опциональный чекбокс «Хочу получать рассылку»** и CTA-блок
в конце курса, который открывает модалку с проставленным чекбоксом.

## What Changes
- `web/contact-modal.js`: в `buildModal()` добавить checkbox
  `id="contact-newsletter"` + label; включить в `focusables`; в обработчике
  `sendBtn` добавить в payload `newsletter: 'yes' | 'no'`.
- `web/course-openspec.html`: в конце (после модуля 8, перед `back-link`)
  добавить CTA-блок «Понравился курс? Подпишись на рассылку» с кнопкой,
  открывающей модалку и проставляющей `contact-newsletter.checked = true`.

## Impact
- Только фронтенд. Нет бэкенда, нет новых Formspree-форм (endpoint тот же).
- `publish-policy.json` не меняется (чекбокс — часть существующей модалки).
- Риск: минимальный. Модалка уже работает на всех 7 страницах.
