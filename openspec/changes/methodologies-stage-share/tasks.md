# Tasks: Share current stage and its required steps

## Implementation
- [x] 1.1 `methodologies.html`: при выборе этапа обновлять URL `?stage=<StageName>` через `history.replaceState`
- [x] 1.2 При загрузке читать `?stage=` из `URLSearchParams` и восстанавливать `selectedStage` (unknown/пусто → `all`)
- [x] 1.3 Добавить кнопку «Поделиться» рядом с фильтром этапов (focus-ring, доступна с клавиатуры, ≥44px tap-target)
- [x] 1.4 Построить share-payload: deep-link URL + название этапа + для каждой методики этапа её `titleRu` и все её `steps` (полный чек-лист)
- [x] 1.5 Для `stage=all` — payload = ссылка + подсказка выбрать этап (без полного чек-листа)
- [x] 1.6 Шеринг: `navigator.share(payload)` если доступен, иначе `navigator.clipboard.writeText` + видимое подтверждение
- [x] 1.7 Мобайл/in-app: кнопка (min-h 44px) и подтверждение корректны в Threads/Telegram WebView

## Verification
- [x] 2.1 `?stage=Execution` при загрузке восстанавливает фильтр Execution (CDP: T1/T1b/T1c)
- [x] 2.2 Смена этапа меняет `?stage=` без перезагрузки (CDP: T4)
- [x] 2.3 «Поделиться» на конкретном этапе даёт ссылку + шаги всех методик этапа (CDP: T3/T3b/T3c/T3d)
- [x] 2.4 `navigator.share` вызывается при наличии; иначе clipboard + подтверждение (CDP: T3, T5, T5b)
- [x] 2.5 `openspec validate methodologies-stage-share`

## Out of scope
- [ ] Структура реестра методик (не меняем)
- [ ] Фильтр по виду (kind) в объёме чек-листа
- [ ] Развёрнутый чек-лист для `stage=all`
