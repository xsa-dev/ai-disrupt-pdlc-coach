## Phase 1: Реализация
- [x] strictMode + чекбокс #quiz-strict
- [x] answer(): strict + неверно -> next скрыт, правильный кликабелен и показывает next
- [x] keydown: Enter блокируется, пока не выбран верный (strict+неверно)
- [x] подсказка обновлена
## Phase 2: Верификация
- [x] jsdom strict: неверный -> next скрыт; клик верного -> next виден; Enter дальше
- [x] jsdom strict: верный сразу -> Enter дальше
- [x] jsdom non-strict: Enter после ошибки идёт дальше (старое поведение)
- [x] curl -> HTTP 200
## Phase 3: Git
- [x] Коммит web: quiz strict mode
