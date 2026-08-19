# Tasks: Web Roadmap Tool (retroactive spec for roadmap.html)

## Implementation (retroactive — tool already live)
- [x] 1.1 Подтвердить, что `web/roadmap.html` живой и содержит выбор currentL/targetL
- [x] 1.2 Подтвердить генерацию roadmap (этапы, практики, gate-критерии)
- [x] 1.3 Подтвердить антипаттерны в roadmap
- [x] 1.4 Подтвердить экспорт PDF и Markdown (copy)
- [x] 1.5 Подтвердить адаптивную вёрстку (viewport/media)
- [x] 1.6 Подтвердить кнопку «Пример» и возврат на diagnosis.html

## Specification
- [x] 2.1 Написать proposal.md (веб-инструмент, без Telegram-бота)
- [x] 2.2 Написать delta-spec web-roadmap (4 Requirement + Scenario)
- [x] 2.3 Написать tasks.md (retroactive, задачи закрыты)

## Out of scope (deferred)
- [ ] Exact data from levels.py (currently hardcoded in JS)
- [ ] Transition testing matrix (L1→L3, L2→L5, etc.)
- [ ] Consistency check with scenarios.md (SR-2)
- [ ] Telegram bot variant (separate project, not on GitHub Pages)

## Verification
- [x] `openspec validate web-roadmap` passes
- [x] Live: roadmap.html HTTP 200, features present
- [ ] Archive after review (both reviewers GO + user confirm)
