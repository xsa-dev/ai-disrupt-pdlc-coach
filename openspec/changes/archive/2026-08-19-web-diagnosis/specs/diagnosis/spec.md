# diagnosis Specification (delta)

## ADDED Requirements

### Requirement: Team runs a structured diagnosis in the browser
The site SHALL provide a web tool (`web/diagnosis.html`) that walks a team through a structured maturity assessment (questions, progress, results screen) without a backend.

#### Scenario: Assessment produces a result
- **WHEN** a team enters its name and completes the diagnosis questions
- **THEN** the tool SHALL show a results screen with the assessed L-level and R-level

### Requirement: Assessment covers L0-L5 and R0-R5
The tool SHALL evaluate organizational maturity (L0-L5) and agent autonomy (R0-R5) as distinct dimensions, and SHALL produce an evidence-based report with strengths, gaps, and recommendations.

#### Scenario: Both dimensions assessed
- **WHEN** the assessment completes
- **THEN** the report SHALL state both an L-level (L0-L5) and an R-level (R0-R5)

### Requirement: Report is generated and copyable
The tool SHALL generate a structured report artifact from the assessment and SHALL let the user copy it to the clipboard (`copyReport()` via `navigator.clipboard`). PDF download is not implemented: `jsPDF` is bundled but not instantiated, and `html2pdf` is not used.

#### Scenario: Report copy
- **WHEN** the results screen is shown
- **THEN** the user SHALL be able to copy the report to the clipboard
- **AND** no file download is offered (client-side PDF export is out of scope)

### Requirement: Report is grounded in the whitepaper
The tool SHALL reference AI-Disrupt PDLC concepts (maturity levels, autonomy, governance) and SHALL include provenance to the book where claims are made.

#### Scenario: Grounded claim
- **WHEN** the report makes a maturity or governance claim
- **THEN** it SHALL reference the relevant concept from the whitepaper
