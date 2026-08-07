# web-methodologies Specification

## Purpose
TBD - created by archiving change web-methodologies. Update Purpose after archive.
## Requirements
### Requirement: Methodology page and navigation
The web application SHALL provide a static Russian-language page at `web/methodologies.html` and SHALL expose a «Методики» navigation item from diagnosis, roadmap, antipatterns, and methodologies pages.

#### Scenario: User opens the methodologies section
- **WHEN** a user selects «Методики» from any web section
- **THEN** the browser SHALL open `methodologies.html` and SHALL show the methodologies navigation item as active

### Requirement: Source-grounded MVP catalog
The page SHALL contain exactly these 12 MVP entries: PR/FAQ, Outcome Hypothesis, Адаптация или перепроектирование, Матрица применимости агента, Mob Elaboration, SDD-цикл, Human-in-the-loop Decision Map, Session Handoff Protocol, Eval-driven development, Evidence Bundle, R0–R5: риск-адаптивная лестница разрешений, and Governance Mesh. Every entry MUST reference one or more verified whitepaper sections, and generated or internal content MUST NOT be presented as whitepaper content.

#### Scenario: Catalog source integrity is checked
- **WHEN** the catalog data is validated
- **THEN** all 12 required unique IDs SHALL exist exactly once and every entry SHALL contain a non-empty verified section reference

#### Scenario: Source does not support a claim
- **WHEN** a proposed card statement cannot be traced to the whitepaper
- **THEN** the statement SHALL be removed, explicitly labeled as interpretation, or excluded from the MVP

### Requirement: Explicit entity taxonomy
Each catalog entry SHALL be classified as `method`, `artifact`, or `governance-model`, and the UI SHALL display that classification in Russian without representing every entity as a methodology.

#### Scenario: Artifact card is rendered
- **WHEN** the PR/FAQ, Outcome Hypothesis, Session Handoff Protocol, or Evidence Bundle entry is displayed
- **THEN** the UI SHALL label it as an artifact rather than as a method

### Requirement: Lifecycle navigation and filtering
The page SHALL provide lifecycle filters for Discovery, Specification, Execution, Validation, Outcome, and Governance and type filters for method, artifact, and governance model. Filters SHALL operate without a page reload and SHALL provide an explicit way to return to the full catalog.

#### Scenario: User filters by lifecycle stage
- **WHEN** a user selects the Validation stage
- **THEN** only entries associated with Validation SHALL remain visible and the selected filter state SHALL be visually and programmatically identifiable

#### Scenario: User resets filters
- **WHEN** a user selects «Все»
- **THEN** all 12 entries SHALL be visible again

### Requirement: Actionable methodology details
Every entry SHALL expose: purpose, when to use, applicability limits, inputs, ordered steps, output artifact or decision, Definition of Done, related antipatterns, source section, and printed source page. When the whitepaper does not define an applicability limit, the entry SHALL display «В источнике не указано» instead of an invented rule. Empty mandatory fields MUST fail the content-integrity test.

#### Scenario: User expands an entry
- **WHEN** a user opens a methodology detail panel
- **THEN** all mandatory fields SHALL be available without navigation to another page

#### Scenario: Source omits an applicability limit
- **WHEN** the verified source passages do not define when an entry must not be used
- **THEN** the entry SHALL display «В источнике не указано» and SHALL NOT add an unsupported limitation

### Requirement: Cross-section context
The page SHALL explain the path Diagnosis → Roadmap → Methodologies → Antipatterns and SHALL provide working links to the Roadmap and Antipatterns sections. Related antipattern names on an entry SHALL use names present in the antipattern registry.

#### Scenario: Related antipattern data is validated
- **WHEN** methodology data references an antipattern
- **THEN** the referenced name SHALL exactly match an existing antipattern registry entry

### Requirement: Responsive and accessible static implementation
The page SHALL use the existing static HTML, Tailwind CDN, Font Awesome CDN, Inter, Space Grotesk, and emerald visual language. It SHALL remain usable at a 744 CSS-pixel viewport without horizontal document scrolling, SHALL use unique HTML IDs, and SHALL support keyboard activation of filters and detail controls.

#### Scenario: Page is checked at iPad mini portrait width
- **WHEN** the viewport width is 744 CSS pixels
- **THEN** the document SHALL have no horizontal overflow and all catalog controls SHALL remain visible and operable

#### Scenario: Page quality gate runs
- **WHEN** the web regression suite executes
- **THEN** source integrity, duplicate IDs, inline JavaScript syntax, internal links, keyboard controls, and mobile overflow checks SHALL pass

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
