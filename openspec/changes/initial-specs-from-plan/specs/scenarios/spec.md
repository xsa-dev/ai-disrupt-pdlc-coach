## ADDED Requirements

### Requirement: Team maturity diagnosis
The Coach SHALL assess organizational maturity L0-L5, agent autonomy R0-R5, and task horizon as distinct dimensions and SHALL produce an evidence-based report with strengths, gaps, warnings, and gate criteria.

#### Scenario: Contradictory answers are not averaged away
- **WHEN** a task-horizon answer conflicts with a claimed maturity level
- **THEN** the Coach SHALL cap the result or request clarification and SHALL explain the contradiction

### Requirement: Transformation roadmap
The Coach SHALL build a roadmap from a current L-level to a higher target level with practices, gate criteria, risks, and canonical transition horizons.

#### Scenario: Roadmap contains every transition
- **WHEN** a team requests a roadmap from L1 to L4
- **THEN** the artifact SHALL contain separate L1-L2, L2-L3, and L3-L4 stages

### Requirement: Practice audit and transformation follow-up
The Coach SHALL evaluate current practices against the whitepaper and SHALL support checkpoint-based updates to an existing roadmap.

#### Scenario: Follow-up preserves prior context
- **WHEN** a team reports progress at a later checkpoint
- **THEN** the Coach SHALL compare the update with the previous roadmap and gate criteria
