## Phase 1: Исправление генерации пула
- [x] Изменить блок QUIZ GENERATION: дистракторы = shuffle(ALL.filter(x=>x!==correct)), pool = shuffle(distractors.slice(0,3).concat(correct))
- [x] Убедиться, что для type=name ALL=ALL_NAMES, для type=fix ALL=ALL_FIXES
## Phase 2: Верификация
- [x] Node-симуляция: 50 билетов/500 вопросов, дублей в pool=0, correct всегда в pool ровно 1 раз
- [x] Node-симуляция: полный проход все верно -> score == ticket length (10/10)
- [x] curl публичного URL через туннель -> HTTP 200, size совпадает
## Phase 3: Git
- [x] Коммит web: fix quiz option duplicates
