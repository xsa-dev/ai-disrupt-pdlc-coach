# Tasks: Web Diagnosis Tool (retroactive spec for diagnosis.html)

## Implementation (retroactive — tool already live)
- [x] 1.1 Подтвердить, что `web/diagnosis.html` живой и содержит опрос (question-container, next-btn, questions-screen)
- [x] 1.2 Подтвердить results-screen с оценкой L-level / R-level
- [x] 1.3 Подтвердить генерацию отчёта (copyReport → navigator.clipboard) — PDF-download НЕ реализован (jsPDF подключён, но не инстанциируется; html2pdf не используется)
- [x] 1.4 Подтвердить покрытие L0-L5 и R0-R5 (по 6 уровней)
- [x] 1.5 Подтвердить grounding в книгу (whitepaper / источники в отчёте)
- [x] 1.6 Подтвердить связь с roadmap (roadmap-container / roadmap-section)

## Specification
- [x] 2.1 Написать proposal.md (веб-инструмент, без Telegram-бота)
- [x] 2.2 Написать delta-spec diagnosis (4 Requirement + Scenario)
- [x] 2.3 Написать tasks.md (retroactive, задачи закрыты)

## Out of scope (deferred)
- [ ] Server-side storage of reports (localStorage/PDF only — client-side)
- [ ] Pause/resume diagnosis session (web tool runs in one pass)
- [ ] Telegram bot variant (separate project, not on GitHub Pages)

## Verification
- [x] `openspec validate web-diagnosis` passes
- [x] Live: diagnosis.html HTTP 200, features present
- [ ] Archive after review (both reviewers GO + user confirm)
