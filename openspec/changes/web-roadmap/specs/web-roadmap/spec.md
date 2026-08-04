## ADDED Requirements

### Requirement: Roadmap level selection
The web roadmap SHALL accept a current L-level and a higher target L-level through manual controls or validated diagnosis URL parameters.

#### Scenario: Valid diagnosis handoff
- **WHEN** the page receives `currentL` in the inclusive range 0-4
- **THEN** it SHALL preselect that current level and a valid higher target

#### Scenario: Invalid diagnosis handoff
- **WHEN** `currentL` is missing, non-numeric, or outside the supported range
- **THEN** the page SHALL use a safe default and SHALL remain operable without a JavaScript exception

### Requirement: Canonical staged roadmap
The web roadmap SHALL produce one stage for every transition from the current level to the target level using canonical horizons: L0-L1 in days, L1-L2 in 1-3 months, L2-L3 in 6-12 months, and L3-L4 in 12-18 months.

#### Scenario: Multi-stage roadmap generation
- **WHEN** a user generates a roadmap from L1 to L4
- **THEN** the output SHALL include L1-L2, L2-L3, and L3-L4 with the canonical horizon for each stage

### Requirement: Actionable stage content
Every roadmap stage SHALL include key practices, gate criteria, and risks or antipatterns grounded in AI-Disrupt PDLC principles.

#### Scenario: Stage is rendered
- **WHEN** a transition stage appears in the roadmap
- **THEN** the user SHALL see its practices, gate criteria, risks, and transition horizon

### Requirement: Roadmap export and diagnosis integration
The page SHALL support PDF export, Markdown copy, and navigation from diagnosis while preserving a valid L0 result.

#### Scenario: Diagnosis result is L0
- **WHEN** diagnosis passes L0 to the roadmap page
- **THEN** the roadmap SHALL start at L0 and SHALL NOT replace it with a fallback level

#### Scenario: User exports roadmap
- **WHEN** the user selects PDF or Markdown export after generation
- **THEN** the exported artifact SHALL contain all rendered stages and source attribution
