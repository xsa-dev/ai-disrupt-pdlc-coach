# Tasks: Course Access Gamification (Behavioral Gate)

## Implementation
- [ ] 1.1 На `openspec.html` добавить кнопку «Мне интересно» (interest-сигнал)
- [ ] 1.2 На `openspec.html` добавить locked-state входа в курс (затемнён/disabled)
- [ ] 1.3 JS: таймер пребывания на `openspec.html` (≥ N сек, N=20 по умолчанию, конфиг)
- [ ] 1.4 JS: обработчик «интересно» + проверка таймера → unlock
- [ ] 1.5 При unlock: `localStorage.courseAccess='unlocked'` + анимация разблокировки
- [ ] 1.6 На `course-openspec.html`: при загрузке проверка флага → locked-экран + CTA
- [ ] 1.7 Retention: возврат в курс после unlock → приветственная анимация
- [ ] 1.8 CSS анимации разблокировки (seal/reveal) — чистый CSS/JS, без либ

## Verification
- [ ] 2.1 Чистый профиль: курс locked на openspec.html; после ≥20с + «интересно» → unlocked + анимация
- [ ] 2.2 `localStorage.courseAccess` сохраняется между визитами
- [ ] 2.3 `course-openspec.html` без флага → locked-экран + CTA
- [ ] 2.4 Работает в Telegram/Threads in-app WebView (localStorage доступен)
- [ ] 2.5 `openspec validate course-gamification`

## Config
- [ ] N секунд (MIN_DWELL_SECONDS = 20) — параметр в JS

## Out of scope
- [ ] Изменение контента курса (change course-rewrite)
- [ ] Серверная авторизация
