# Tasks: Mobile & In-App Browser Adaptation

## Implementation
- [ ] 1.1 Добавить `viewport-fit=cover` во все `web/*.html` (7 страниц)
- [ ] 1.2 Добавить safe-area padding к `:root`/`body` и контейнерам (env(safe-area-inset-*))
- [ ] 1.3 Заменить `100vh` → `100dvh` (+ `100vh` fallback) в hero/modal/sticky CSS
- [ ] 1.4 Отодвинуть `position: fixed` (contact-modal.css, course styles) на safe-area + dvh
- [ ] 1.5 Минимум 44px tap-targets для `.site-nav-link`, кнопок, `.contact-fab`
- [ ] 1.6 Убрать hover-only зависимости (добавить active/tap состояния)
- [ ] 1.7 Проверить course-openspec/styles.css на те же правила

## Verification
- [ ] 2.1 `curl` всех 7 страниц: viewport содержит `viewport-fit=cover`
- [ ] 2.2 `grep -r "100dvh" web/` и `grep -r "env(safe-area-inset" web/`
- [ ] 2.3 Chrome CDP viewport-тест (375px) — модалка не обрезается, футер виден
- [ ] 2.4 `openspec validate web-mobile-inapp`

## Out of scope
- [ ] Отдельная мобильная версия (делаем responsive)
- [ ] Изменение контента страниц
