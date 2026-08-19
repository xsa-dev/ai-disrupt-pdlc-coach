# telegram-interface Specification

## Purpose
TBD - created by archiving change initial-specs-from-plan. Update Purpose after archive.
## Requirements
### Requirement: Telegram scenario commands
The Telegram adapter SHALL expose commands for team selection, diagnosis, roadmap, audit, element design, status, and artifact retrieval, or SHALL explicitly mark unavailable post-MVP commands as such.

#### Scenario: Supported command starts its scenario
- **WHEN** a user invokes a supported scenario command
- **THEN** the bot SHALL start or resume the corresponding state machine

### Requirement: User-safe conversational state
The Telegram adapter SHALL isolate active state by both chat and user identity unless a group-scoped workflow is explicitly configured.

#### Scenario: Concurrent group users remain isolated
- **WHEN** two users start diagnosis in the same group chat
- **THEN** one user's answers SHALL NOT overwrite or advance the other user's session

### Requirement: Readable Telegram artifacts
The Telegram adapter SHALL escape dynamic content for the selected parse mode and SHALL provide a separately generated readable plain-text fallback.

#### Scenario: Formatted delivery fails
- **WHEN** Telegram rejects a formatted artifact
- **THEN** the fallback message SHALL remain readable and SHALL NOT expose formatting escape sequences

