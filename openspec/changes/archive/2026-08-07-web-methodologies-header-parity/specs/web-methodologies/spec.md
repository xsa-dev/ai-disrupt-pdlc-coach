## ADDED Requirements

### Requirement: Methodologies uses a standard page intro
The methodologies page SHALL begin its main content with a compact page intro that is visually separate from the shared site header and SHALL NOT render a unique decorative third header row.

#### Scenario: User opens methodologies
- **WHEN** `methodologies.html` is rendered
- **THEN** the shared site header is followed by one `data-page-intro` section containing the page title and explanatory copy
- **AND** the intro does not contain the decorative compass icon or `AI-Disrupt PDLC` eyebrow
- **AND** the page title uses the standard `text-3xl sm:text-4xl` responsive scale

#### Scenario: Catalog behavior remains intact
- **WHEN** the intro is simplified
- **THEN** lifecycle filters, type filters, 12 methodology cards and inline details continue to work unchanged
