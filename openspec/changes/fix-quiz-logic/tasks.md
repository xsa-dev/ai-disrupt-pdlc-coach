# Tasks — Fix Quiz Logic

## Phase 1: Исправление генерации пула
- [ ] Изменить блок QUIZ GENERATION: дистракторы = `shuffle(ALL.filter(x=>x!==correct))`, pool = `shuffle(distractors.slice(0,3).concat(correct))`
- [ ] Убедиться, что для type='name' ALL=ALL_NAMES, для type='fix' ALL=ALL_FIXES

## Phase 2: Верификация
- [ ] Node-симуляция: прогнать N билетов, проверить, что дублей в pool=0, correct всегда в pool ровно 1 раз
- [ ] Node-симуляция: полный проход "все верно" → score == ticket length
- [ ] curl публичного URL через туннель → HTTP 200, size совпадает с файлом

## Phase 3: Git
- [ ] Коммит `web: fix quiz option duplicates (unique distractors, no correct-answer dup)`
