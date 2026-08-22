# Tasks: Replace newsletter subscription with static links

## Implementation
- [ ] 1.1 Удалить блок `newsletter-cta` (модуль 6) из `web/course-openspec.html`
- [ ] 1.2 Удалить `course-footer-subscribe-btn` из футера
- [ ] 1.3 В футере добавить Telegram-ссылку `https://t.me/alxy_tg?text=Привет, хочу узнать про OpenSpec` (рядом с GitHub)
- [ ] 1.4 Убедиться, что email-связь остаётся (contact-modal «Связь с автором» в футере или mailto)

## Verification
- [ ] 2.1 `grep course-newsletter-btn course-footer-subscribe-btn` в course-openspec.html → 0
- [ ] 2.2 Футер содержит Telegram `?text=` ссылку + GitHub + email/mailto
- [ ] 2.3 `openspec validate replace-subscribe-with-links`

## Out of scope
- [ ] contact-modal (связь с автором) — не трогаем
- [ ] гейт доступа (course-gamification)
