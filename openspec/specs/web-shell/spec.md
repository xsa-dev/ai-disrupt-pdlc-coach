# web-shell Specification

## Purpose
TBD - created by archiving change web-header-consistency. Update Purpose after archive.
## Requirements
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

### Requirement: Shared semantic site footer with methodology attribution, disclaimer, and polished styling
Every published page (`diagnosis.html`, `roadmap.html`, `methodologies.html`, `antipatterns.html`, `openspec.html`, `course-openspec.html`, `glossary.html`) SHALL render a semantically identical footer `<footer data-site-footer class="site-footer">` containing an inner container `<div class="site-footer__inner">` containing:
1. A direct link to the official methodology guide «Руководство по генеративной разработке ПО →» (`https://aipdlc.ru/documents/ru/whitepaper_full_ru.pdf`, `target="_blank"`, `rel="noopener"`).
2. Explicit authorship attribution identifying **Кирилл Меньшов** as the author of the AI-Disrupt PDLC concept, **ПАО Сбербанк** with an external link to `https://aipdlc.ru/ru/` as the copyright holder, and **xsa-dev** with an external link to `https://github.com/xsa-dev` as the site developer.
3. A legal disclaimer stating that the site is an independent non-commercial educational instrument, citing AI-Disrupt PDLC materials in accordance with the official rules at `https://aipdlc.ru/ru/legal-info`.
4. Polished visual styling via `web/web-mobile.css`: subtle `#f8fafc` background, top border `#e2e8f0`, safe-area insets padding (`calc(2.5rem + var(--sab))`), styled guide pill with hover microanimation, and responsive card-style disclaimer container without horizontal overflow.

#### Scenario: User visits any page and views the footer
- **WHEN** the user opens any of the seven published pages
- **THEN** a `<footer data-site-footer>` element is present at the bottom of the page
- **AND** the footer contains an inner container `<div class="site-footer__inner">`
- **AND** the footer contains an external link to `https://aipdlc.ru/documents/ru/whitepaper_full_ru.pdf` with text containing "Руководство по генеративной разработке ПО"
- **AND** the footer contains attribution text naming "Кирилл Меньшов" as author of the concept and linking to "https://aipdlc.ru/ru/" for "ПАО Сбербанк" as copyright holder
- **AND** the footer contains a disclaimer text starting with "Отказ от ответственности:" and linking to "https://aipdlc.ru/ru/legal-info"
- **AND** the footer layout renders with safe-area bottom padding and zero horizontal document overflow at 390px and 744px

