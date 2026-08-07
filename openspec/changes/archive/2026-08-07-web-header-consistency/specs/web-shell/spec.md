## ADDED Requirements

### Requirement: Shared two-row header shell
The four web pages SHALL render one semantic site header consisting of the same navigation row followed by the same brand row structure. Both rows SHALL use the same `max-w-5xl` container and responsive horizontal padding.

#### Scenario: User switches between product pages
- **WHEN** the user navigates among `diagnosis.html`, `roadmap.html`, `methodologies.html`, and `antipatterns.html`
- **THEN** the top navigation and brand row align to the same horizontal boundaries and vertical rhythm

### Requirement: Consistent navigation contract
The site header SHALL expose links in the order `Диагностика`, `Roadmap`, `Методики`, `Антипаттерны`. Exactly one link SHALL identify the current page with `aria-current="page"` and the shared active visual state.

#### Scenario: Current page is announced and highlighted
- **WHEN** any of the four pages loads
- **THEN** exactly one navigation link matches the current page, carries `aria-current="page"`, and uses the common active classes

### Requirement: Stable page identity
The brand row SHALL use the same icon-box dimensions, title typography, spacing, background, border, and padding on every page. The icon glyph and subtitle MAY identify the current page without changing row geometry.

#### Scenario: Page-specific identity is displayed
- **WHEN** a page renders its brand row
- **THEN** `Disrupt PDLC Coach` remains in the same position and the page subtitle identifies the current section

### Requirement: Responsive header usability
The shared header SHALL remain visible and operable without horizontal document overflow at 390 and 744 CSS pixels. Page-specific header actions SHALL NOT increase the mobile header height or hide primary navigation.

#### Scenario: Header is rendered on phone
- **WHEN** the viewport width is 390 CSS pixels
- **THEN** all four navigation destinations remain reachable and the document has no horizontal overflow caused by the header

#### Scenario: Header is rendered on iPad mini portrait
- **WHEN** the viewport width is 744 CSS pixels
- **THEN** both header rows preserve their shared geometry and page-specific actions remain operable

### Requirement: Header regression evidence
The repository SHALL include automated structural tests and real-browser responsive checks for the shared header contract, while existing diagnosis, roadmap, methodologies, and antipattern functionality remains unchanged.

#### Scenario: Header quality gate runs
- **WHEN** the web regression suite executes
- **THEN** it verifies page coverage, link order, active state, shared class contract, unique IDs, and responsive overflow
