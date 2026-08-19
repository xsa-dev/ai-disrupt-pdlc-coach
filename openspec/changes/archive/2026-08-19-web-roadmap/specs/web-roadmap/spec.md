# web-roadmap Specification (delta)

## ADDED Requirements

### Requirement: Team builds a roadmap in the browser
The site SHALL provide a web tool (`web/roadmap.html`) that builds a transformation roadmap from a current level to a target level, without a backend.

#### Scenario: Roadmap is generated
- **WHEN** a team selects a current level and a target level
- **THEN** the tool SHALL render a roadmap with staged transitions, practices, and gate criteria

### Requirement: Roadmap covers practices, gates, and antipatterns
The tool SHALL include, for each transition, concrete practices, gate criteria for advancing, and relevant antipatterns drawn from the AI-Disrupt PDLC methodology.

#### Scenario: Transition content
- **WHEN** a transition (e.g. L1→L2) is shown
- **THEN** it SHALL list practices, gate criteria, and antipatterns

### Requirement: Roadmap is exportable
The tool SHALL offer client-side export of the roadmap as PDF and as Markdown (clipboard/copy), with no server storage.

#### Scenario: Export paths
- **WHEN** the roadmap is shown
- **THEN** the user SHALL be able to export it as PDF and copy it as Markdown

### Requirement: Roadmap links back to diagnosis
The tool SHALL let the user return to the diagnosis and SHALL offer an example roadmap for quick exploration.

#### Scenario: Navigation and example
- **WHEN** the user is on the roadmap page
- **THEN** a button SHALL return to `diagnosis.html` and a button SHALL show a sample roadmap
