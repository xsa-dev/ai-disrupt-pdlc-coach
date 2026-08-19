## ADDED Requirements

### Requirement: Layered coach architecture
The system SHALL separate knowledge retrieval, team context storage, core coaching logic, scenario tools, channel adapters, and guardrails into explicit components.

#### Scenario: Channel adapter uses domain logic
- **WHEN** a channel receives a diagnosis request
- **THEN** the adapter SHALL invoke shared domain logic rather than implement a separate scoring model

### Requirement: Persistent scenario state
The system SHALL persist team state and scenario handoff data so an interrupted scenario can be resumed without mixing teams or users.

#### Scenario: Resume interrupted scenario
- **WHEN** an identified team resumes an interrupted scenario
- **THEN** the system SHALL restore that team's last valid checkpoint and answers

### Requirement: Extensible knowledge and tools
The architecture SHALL allow new scenarios, tools, and internal knowledge collections without weakening grounding in the whitepaper.

#### Scenario: Internal knowledge remains distinguishable
- **WHEN** an internal case is added
- **THEN** the system SHALL preserve its provenance separately from whitepaper content
