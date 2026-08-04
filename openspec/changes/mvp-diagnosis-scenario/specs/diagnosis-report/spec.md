## ADDED Requirements

### Requirement: Safe Telegram diagnosis report
The diagnosis flow SHALL deliver a readable structured report using one supported Telegram parse mode, SHALL escape every dynamic value for that mode, and SHALL generate a separate plain-text fallback.

#### Scenario: Dynamic content contains formatting characters
- **WHEN** a team name or report field contains parse-mode control characters
- **THEN** Telegram SHALL render the value as text without rejecting the message or exposing escape sequences

#### Scenario: Formatted report is rejected
- **WHEN** Telegram rejects the formatted report
- **THEN** the bot SHALL send a separately generated plain-text report that remains human-readable

### Requirement: Professional PDF diagnosis report
The diagnosis flow SHALL generate a multi-page PDF with readable wrapping, consistent headers and footers, and no clipped report sections.

#### Scenario: Long report spans pages
- **WHEN** justification and recommendations exceed one page
- **THEN** content SHALL flow across pages with headers, footers, and complete text

### Requirement: Verified whitepaper evidence
A PDF quotation section SHALL contain only retrieved and verified whitepaper passages with provenance; the section MUST NOT be rendered when valid evidence is unavailable.

#### Scenario: Grounding returns verified passages
- **WHEN** one or more passages meet the quality and provenance requirements
- **THEN** the PDF SHALL render those passages as quotations with source metadata

#### Scenario: Grounding fails
- **WHEN** retrieval fails or returns no verified passage
- **THEN** the PDF SHALL omit the quotation section and SHALL log the grounding failure
