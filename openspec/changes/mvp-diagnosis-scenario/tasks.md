# Tasks - MVP Diagnosis Scenario

## Status Legend
- [ ] Not started
- [x] Done
- [~] In progress

## High-level breakdown

### 1. Knowledge & Grounding
- [x] Extract and structure L0-L5 profiles + gate criteria from whitepaper into machine-readable form (JSON or Python dict)
- [x] Extract and structure R0-R5 ladder + examples
- [x] Create a small knowledge module that can answer "what does L2 look like?" with direct references

### 2. Assessment Engine
- [x] Design a set of diagnostic questions mapped to the book's criteria (cover organizational maturity, agent usage, validation, governance, environment vs model)
- [x] Implement scoring logic that maps answers → L level + R level + task horizon
- [x] Add rules for common mistakes (guardrails against overestimation) (mixing L/R/horizon axes) — basic version present
- [x] Engine explains conclusions + pulls excerpts from book with book references — partial, via report template

### 3. Telegram Flow (Diagnosis)
- [x] Add command /diagnosis (8 questions) (or `/diagnosis`)
- [x] Implement conversational flow (step-by-step) (step-by-step questions or smart questionnaire)
- [x] **Fix broken escaping** — visible `A\.`, `\(A/B/C/\.\.\.\)`, mixed parse_mode causing "битый текст" in questions (recorded 2026-07-23)
- [ ] Allow pausing and resuming a diagnostic session for a team
- [x] Full Markdown report with excerpts + warnings (clean MarkdownV2 + PDF fallback)
- [ ] Offer to save the report to team profile and/or start roadmap (future)

### 4. Team Context & Persistence (minimal)
- [x] Define TeamProfile model (current L/R levels, last assessment date, history of reports)
- [x] Implement simple persistence (JSON) (JSON files or SQLite for now)
- [x] Command /status and /team to switch/view team context
- [ ] Store generated reports so they can be retrieved later

### 5. Report Generation
- [ ] Create a high-quality Markdown report template that includes:
  - Current levels with justification
  - Strengths / Gaps
  - Recommended next actions + gate criteria to reach next level
  - Warnings about common anti-patterns
- [ ] Make sure the report is grounded (mentions specific concepts from the book)

### 5.1 Report Formatting Fixes (2026-07-23)
- [x] Fix Telegram MarkdownV2 report:
  - Stop over-escaping formatting characters (`*`, `_`, `•`)
  - Apply `_escape_md_v2` only to literal content
  - Ensure **bold** and lists render correctly without visible `\*` or `\-`
  - Switched bot to generate_diagnosis_markdown + parse_mode=MarkdownV2
  - Updated get_status and messages to use * for bold (no HTML tags)
- [x] Fix PDF report layout:
  - Created `DiagnosisPDF` subclass with `header()` + `footer()`
  - Page numbers + "Disrupt PDLC Coach • 2026" on every page
  - Proper multi_cell wrapping + clean pagination
  - Improved excerpt summarization (1-2 sentences)
- [x] Created delta spec: openspec/changes/mvp-diagnosis-scenario/specs/report-formatting.md

### 6. Guardrails & Quality
- [ ] Add checks that the assessment does not overstate the level
- [ ] Ensure every important claim can be traced back to the whitepaper
- [ ] Add explicit "Non-goals" and honesty statements in reports when appropriate

### 7. Testing & Validation
- [ ] Create a few synthetic team profiles + expected assessment outcomes
- [ ] Manual test the full flow in Telegram (or simulation)
- [ ] Validate that generated reports are consistent with the book's definitions

### 8. Documentation & OpenSpec
- [ ] Update relevant specs if needed (delta specs)
- [ ] Mark this change as ready for review / archive when MVP is complete
- [ ] Add notes in PLAN.md about progress

## Priority order for implementation
1. Knowledge extraction (L0-L5 + R0-R5)
2. Assessment engine core
3. Basic report generator (can be used without Telegram first)
4. Simple persistence + team context
5. Telegram conversational flow
6. Full end-to-end testing + guardrails
7. Polish + OpenSpec sync

## Dependencies
- Access to the whitepaper text (already extracted)
- Telegram bot framework (to be decided in design)
- Python environment

## Acceptance Criteria for this change
- A user can start a diagnosis for a team
- After answering questions, they receive a useful, honest, book-grounded report
- The report correctly classifies at least the broad maturity band (L0/L1/L2 vs L3+)
- Team context is saved and `/status` shows previous assessment
- No violation of core principles from the whitepaper

## Notes
This change focuses only on the **diagnosis** scenario. Roadmap generation and element design will be separate changes after this MVP is validated.