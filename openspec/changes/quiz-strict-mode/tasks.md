# Tasks — Quiz Strict Mode

## Phase 1: Реализация
- [ ] Добавить `let strictMode=false` и чекбокс `#quiz-strict` в `#quiz-setup`
- [ ] `answer()`: при strictMode && неверно — скрыть `#quiz-next`, правильный вариант кликабелен + показывает next при клике
- [ ] keydown run-ветка: Enter блокируется, пока не выбран верный (strict + неверно)
- [ ] Обновить подсказку про клавиши (упомянуть strict-поведение)

## Phase 2: Верификация
- [ ] jsdom: strict вкл, неверный ответ -> next скрыт; клик верного -> next виден; Enter идёт дальше
- [ ] jsdom: strict вкл, верный ответ сразу -> Enter идёт дальше
- [ ] jsdom: strict выкл -> поведение как раньше
- [ ] curl публичного URL -> HTTP 200

## Phase 3: Git
- [ ] Коммит `web: quiz strict mode (require correct answer on mistake before next)`
- [ ] openspec tasks done
