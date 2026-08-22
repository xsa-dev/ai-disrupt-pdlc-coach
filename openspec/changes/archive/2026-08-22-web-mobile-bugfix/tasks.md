# Tasks: Mobile UI Bugfixes (post in-app audit)

## Implementation
- [ ] 1.1 `web-mobile.css`: `.site-nav-link { padding-right: 0.75rem; flex-shrink: 0 }`
- [ ] 1.2 `web-mobile.css`: `.btn, .chat-next-btn, .chat-all-btn, .chat-reset-btn { white-space: nowrap; flex-shrink: 0 }`

## Verification
- [ ] 2.1 `grep` web-mobile.css: nav padding + btn nowrap присутствуют
- [ ] 2.2 Chrome CDP @390px: nav не склеен (видны отступы), «Следующий шаг» в 1 строку
- [ ] 2.3 `openspec validate web-mobile-bugfix`

## Out of scope
- [ ] Структура nav (только отступы)
- [ ] Логика квизов/диагностики
- [ ] spellcheck (не является багом — подтверждено пользователем)
