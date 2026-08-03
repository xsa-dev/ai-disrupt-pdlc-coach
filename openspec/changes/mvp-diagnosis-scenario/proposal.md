# MVP: Diagnosis Scenario (L0-L5 + R0-R5)

## Summary
Implement the first end-to-end scenario: **Диагностика зрелости команды** (Assessment of team maturity according to AI-Disrupt PDLC).

This is the MVP for the Disrupt PDLC Coach. It allows a team to go through a structured diagnostic conversation in Telegram and receive a high-quality report with current level, justification, strengths/weaknesses, recommendations, and gate criteria for the next level.

## Motivation
- This is the recommended first scenario from the PLAN (Phase 1 MVP).
- It directly applies the core concepts from the whitepaper: L0–L5 organizational maturity, R0–R5 agent autonomy, task horizon, honest self-assessment, and gate criteria.
- Provides immediate value: teams get a clear picture of where they are and what to do next.
- Serves as the foundation for all other scenarios (roadmap, design, audit).

## Goals
- Enable teams to run a full diagnostic session via Telegram.
- Produce accurate, book-grounded assessments using exact L0-L5 and R0-R5 profiles.
- Generate structured, usable Markdown reports.
- Persist team context and assessment history.
- Strictly follow the "honest assessment > inflated levels" principle.

## Non-Goals (for this change)
- Full roadmap generation (next change).
- Element design tools.
- RAG over internal company cases (only the whitepaper for now).
- Complex multi-agent orchestration.
- Web UI or other interfaces.

## Scope
- Telegram command flow for `/start diagnosis`.
- Structured questioning based on the book's criteria.
- Assessment engine that maps answers to L0-L5 and R0-R5.
- Report generation with:
  - Current level(s)
  - Justification with references to book concepts
  - Strengths and gaps
  - Recommended next steps + gate criteria
- Basic team profile storage (current level, last assessment date, history of reports).
- Guardrails to ensure honesty and grounding in the whitepaper.

## Out of Scope
- Automatic code changes or process enforcement.
- Integration with external tools (Jira, Git, etc.).
- Voice or rich media in Telegram for v1.

## Success Metrics
- A team can complete a full diagnosis in one session (< 15-20 minutes).
- The generated report is considered useful and accurate by the team (subjective feedback).
- Assessment correctly identifies at least the broad level (e.g. L1 vs L3) according to the book's definitions.
- No violation of core principles (especially "Среда важнее модели" and honest assessment).

## References
- PLAN.md sections: Сценарий 1, Gate-критерии, L0-L5 profiles, R0-R5.
- Whitepaper: Part 3 (Roles, teams, competencies), section 3.6 Уровни зрелости команды L0–L5.
- Core principles: Среда важнее модели, Валидация встроена, Честная оценка.