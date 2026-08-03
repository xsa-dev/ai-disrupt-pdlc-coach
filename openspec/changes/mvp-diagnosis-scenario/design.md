# Design - MVP Diagnosis Scenario

## High-level Architecture for this change
- **Core Domain Logic** (no Telegram):
  - `levels.py`: Hardcoded (but book-accurate) definitions of L0-L5, R0-R5, gate criteria, common mistakes.
  - `assessment.py`: Takes answers (or structured input) → computes levels + confidence + explanation.
  - `report.py`: Generates high-quality Markdown report.

- **Team Context** (minimal):
  - Simple JSON or SQLite store for team profiles.
  - Current levels + last assessment + list of past reports.

- **Telegram Layer** (thin):
  - Conversational handler for diagnosis.
  - Uses the domain logic.
  - Stores results via team context module.

- **Knowledge grounding**:
  - For MVP: direct references in code + report text to book concepts.
  - Later: proper RAG over whitepaper text.

## Diagnostic Flow (MVP)
1. User starts `/start diagnosis` for a team (or current team).
2. Agent asks a series of questions (or one smart questionnaire).
3. Questions target key dimensions:
   - How AI is currently used (autocompletion vs agentic tasks)
   - Presence of SDD / spec-first practices
   - Validation approach (manual review vs Evidence Bundle + agent reviewer)
   - Governance / guardrails
   - Environment vs model mindset
   - Team size and coordination
4. Assessment engine maps answers to levels.
5. Generate report.
6. Save to team profile.
7. Offer next actions (view report, start roadmap later, etc.).

## Question Design Principles
- Questions should be understandable by engineering teams.
- Avoid leading questions that push toward higher levels.
- Include "I don't know / not applicable" options.
- After answers, allow user to correct or add context.

## Report Structure (Markdown)
```markdown
# Диагностика зрелости команды: <TeamName>

**Дата:** ...
**Текущий уровень:** L2 / R1 (пример)

## Обоснование
...

## Сильные стороны
- ...

## Зоны роста
- ...

## Рекомендации и gate-критерии для перехода на следующий уровень
...

## Предупреждения
- ...
```

## Tech Choices (MVP)
- Language: Python 3.11+
- Telegram: `python-telegram-bot` (v20+) or `aiogram` v3. We will decide based on what is easiest to run persistently.
- Persistence: JSON files in `data/teams/` for simplicity in v1.
- No heavy dependencies initially.

## Risks & Mitigations
- Risk: Teams try to game the assessment to look better.
  - Mitigation: Explicit honesty statements + book references. Agent can challenge suspicious answers.
- Risk: Questions are too vague.
  - Mitigation: Iterative refinement during implementation + examples in questions.
- Risk: Overly complex Telegram state machine.
  - Mitigation: Keep the flow linear for diagnosis MVP. Use conversation handlers.

## Next after this change
Once diagnosis works well, the next change will be "Roadmap generation from assessment result".
