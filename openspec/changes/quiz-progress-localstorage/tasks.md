# Tasks — Quiz Progress (localStorage + Thin Line)

## Phase 1: Storage helpers
- [ ] `loadProgress()` / `saveProgress(p)` с защитой от отсутствия localStorage
- [ ] `recordResult(ticketKey, score, total)` — лучший pct, пересчёт `excellent`, сохранение

## Phase 2: UI
- [ ] HTML: контейнер `#quiz-progress-line` в `#quiz-setup` (подсказка с клавишами)
- [ ] HTML: строка статуса `#quiz-result-status` в `#quiz-result`
- [ ] `renderProgressLine()` — подпись `Отлично: X / 7` + тонкий зелёный бар
- [ ] Вызвать `renderProgressLine()` при загрузке и после возврата в setup

## Phase 3: Wire into flow
- [ ] `finishQuiz()` — вычислить `ticketKey`, вызвать `recordResult`, показать статус в `#quiz-result-status`
- [ ] `ticketKeyOf()` — ключ по текущему режиму/билету

## Phase 4: Verification
- [ ] jsdom: прохождение билета №1 на 100% → excellent содержит `fixed:1`, линия 1/7
- [ ] jsdom: перезагрузка (new JSDOM) читает прогресс из localStorage
- [ ] jsdom: повторное прохождение хуже (напр. 50%) не ухудшает запись
- [ ] curl через туннель → HTTP 200

## Phase 5: Git
- [ ] Коммит web: quiz progress localStorage + thin line
- [ ] Коммит openspec: tasks done
