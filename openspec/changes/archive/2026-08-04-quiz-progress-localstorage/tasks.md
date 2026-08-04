## Phase 1: Storage helpers
- [x] loadProgress / saveProgress с защитой
- [x] recordResult: лучший pct, excellent>=80, сохранение
## Phase 2: UI
- [x] #quiz-progress-line в setup
- [x] #quiz-result-status в результате
- [x] renderProgressLine: «Отлично: X / 7» + тонкий зелёный бар
## Phase 3: Wire
- [x] finishQuiz -> recordResult + статус
- [x] ticketKeyOf
## Phase 4: Verification (jsdom)
- [x] fixed:1 10/10 -> excellent fixed:1, line 1/7
- [x] fixed:2 8/10, fixed:3 9/10 -> line 3/7
- [x] reload (localStorage до скрипта) -> line 3/7, excellent persist
- [x] worse repeat (5/10) не ухудшает (pct stays 100)
- [x] UI finishQuiz пишет реальный score (fixed:4 pct 10)
- [x] no-localStorage -> страница не падает
- [x] curl HTTP 200
## Phase 5: Git
- [x] коммиты web + openspec
