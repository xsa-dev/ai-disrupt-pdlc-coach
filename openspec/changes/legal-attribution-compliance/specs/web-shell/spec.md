# web-shell Specification Delta

## ADDED Requirements

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
