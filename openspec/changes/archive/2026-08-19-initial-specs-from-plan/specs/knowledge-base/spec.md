## ADDED Requirements

### Requirement: Whitepaper-grounded knowledge retrieval
The knowledge layer SHALL retrieve relevant whitepaper passages with provenance sufficient to identify the source section or page.

#### Scenario: Important claim includes provenance
- **WHEN** the Coach makes an important maturity or governance claim
- **THEN** it SHALL provide a verified citation or explicitly state that the source does not contain the claim

### Requirement: No fabricated quotations
The system MUST NOT present generated summaries or fallback text as verbatim whitepaper quotations.

#### Scenario: Retrieval is unavailable
- **WHEN** the whitepaper source cannot be loaded or no passage meets the quality threshold
- **THEN** the system SHALL omit the quotation section or label the content as a summary instead of inventing a quote

### Requirement: Separate internal knowledge provenance
Internal cases and practices SHALL be stored and cited separately from whitepaper content.

#### Scenario: Internal case is used
- **WHEN** a recommendation uses an internal organizational case
- **THEN** the artifact SHALL label it as internal evidence rather than whitepaper guidance
