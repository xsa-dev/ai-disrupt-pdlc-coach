# web-shell Specification

## Purpose
Поддержка единой навигации, шапки и подвала на всех страницах сайта Disrupt PDLC Coach.

## MODIFIED Requirements

### Requirement: Shared two-row header shell
The seven web pages (`diagnosis.html`, `roadmap.html`, `methodologies.html`, `antipatterns.html`, `openspec.html`, `course-openspec.html`, `glossary.html`) SHALL render one semantic site header consisting of the same navigation row followed by the same brand row structure. Both rows SHALL use the same `max-w-5xl` container and responsive horizontal padding.

#### Scenario: User switches between product pages
- **WHEN** the user navigates among the seven pages
- **THEN** the top navigation and brand row align to the same horizontal boundaries and vertical rhythm

### Requirement: Consistent navigation contract
The site header SHALL expose links in the order `Диагностика`, `Roadmap`, `Методики`, `Антипаттерны`, `OpenSpec`, `Курс`, `Глоссарий`. Exactly one link SHALL identify the current page with `aria-current="page"` and the shared active visual state.

#### Scenario: Current page is announced and highlighted
- **WHEN** any of the seven pages loads
- **THEN** exactly one navigation link matches the current page, carries `aria-current="page"`, and uses the common active classes

### Requirement: Responsive header usability
The shared header SHALL remain visible and operable without horizontal document overflow at 390 and 744 CSS pixels. Page-specific header actions SHALL NOT increase the mobile header height or hide primary navigation. On narrow screens, navigation row allows internal horizontal scrolling without document overflow.

#### Scenario: Header is rendered on phone
- **WHEN** the viewport width is 390 CSS pixels
- **THEN** all seven navigation destinations remain reachable and the document has no horizontal overflow caused by the header

#### Scenario: Header is rendered on iPad mini portrait
- **WHEN** the viewport width is 744 CSS pixels
- **THEN** both header rows preserve their shared geometry and page-specific actions remain operable

### Requirement: Header regression evidence
The repository SHALL include automated structural tests and real-browser responsive checks for the shared header contract, while existing diagnosis, roadmap, methodologies, and antipattern functionality remains unchanged.

#### Scenario: Header quality gate runs
- **WHEN** the web regression suite executes
- **THEN** it verifies page coverage, link order, active state, shared class contract, unique IDs, and responsive overflow

## ADDED Requirements

### Requirement: Shared site footer contract
All seven pages SHALL include a semantically identical `<footer data-site-footer class="site-footer">` element containing the methodology guide link (`https://aipdlc.ru/documents/ru/whitepaper_full_ru.pdf`), attribution to `aipdlc.ru (Сбербанк)` and `xsa-dev`, and the legal disclaimer.

#### Scenario: User navigates across all seven pages
- **WHEN** the user opens any of the seven pages including `glossary.html`
- **THEN** a `<footer data-site-footer>` element is present at the bottom of the page
- **AND** the footer contains the guide link, attribution, and disclaimer
