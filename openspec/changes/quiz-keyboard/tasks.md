# Tasks — Quiz Keyboard Support

## Phase 1: Реализация
- [ ] Вынести старт квиза в `startQuiz()`; привязать клик `quiz-start` к ней
- [ ] Добавить `keydown`-слушатель: цифры 1–N выбирают вариант (opts[n-1].click())
- [ ] `Enter`: setup→startQuiz, run(answered)→quiz-next.click(), result→startQuiz (тот же режим)
- [ ] `R`: перезапуск в том же режиме (result и run после ответа)
- [ ] `preventDefault` на управляющих клавишах; игнор в INPUT/SELECT/TEXTAREA
- [ ] Подсказка с клавишами в `#quiz-setup`

## Phase 2: Верификация
- [ ] Node-симуляция: старт по Enter; выбор варианта цифрой 2 → answer() вызван; Enter → quiz-next сработал (idx+1)
- [ ] Node-симуляция: на result Enter → startQuiz (тот же mode), билет пересобран
- [ ] curl публичного URL через туннель → HTTP 200

## Phase 3: Git
- [ ] Коммит `web: quiz keyboard support (1-N select, Enter advance/restart, R)`
- [ ] openspec tasks отмечены выполненными
