## Phase 1: Реализация
- [x] startQuiz(); клик quiz-start
- [x] keydown: цифры 1-N выбирают вариант (opts[n-1].click())
- [x] Enter: setup->startQuiz, run(answered)->quiz-next, result->startQuiz (тот же режим)
- [x] R: перезапуск в том же режиме (result и run после ответа)
- [x] preventDefault на управляющих клавишах; игнор в INPUT/SELECT/TEXTAREA
- [x] Подсказка с клавишами в #quiz-setup
## Phase 2: Верификация
- [x] jsdom: Enter старт, цифра выбирает, Enter продвигает, результат->Enter перезапуск тот же режим, R перезапуск
- [x] curl публичного URL -> HTTP 200
## Phase 3: Git
- [x] Коммит web: quiz keyboard support
