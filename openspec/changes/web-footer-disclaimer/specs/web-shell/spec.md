# web-shell Specification Delta

## ADDED Requirements

### Requirement: Shared semantic site footer with methodology link and disclaimer
Every published page (`diagnosis.html`, `roadmap.html`, `methodologies.html`, `antipatterns.html`, `openspec.html`, `course-openspec.html`) SHALL render a shared semantic footer `<footer data-site-footer>` with:
1. A direct link to the official methodology guide «Руководство по генеративной разработке ПО →» (`https://aipdlc.ru/documents/ru/whitepaper_full_ru.pdf`, `target="_blank"`, `rel="noopener"`).
2. Explicit authorship separation identifying `aipdlc.ru` (Сбербанк) as the source/creator of the AI-Disrupt PDLC methodology and **xsa-dev** as the site developer.
3. A formal disclaimer stating that the site and its diagnostic tools are independent educational/informational instruments and that results/recommendations carry no guarantee.

#### Scenario: User visits any page and views the footer
- **WHEN** the user opens any of `diagnosis.html`, `roadmap.html`, `methodologies.html`, `antipatterns.html`, `openspec.html`, or `course-openspec.html`
- **THEN** a `<footer data-site-footer>` element is present at the bottom of the page
- **AND** the footer contains an external link to `https://aipdlc.ru/documents/ru/whitepaper_full_ru.pdf` with text containing "Руководство по генеративной разработке ПО"
- **AND** the footer contains attribution text referencing both methodology source aipdlc.ru (Сбербанк) and site developer xsa-dev
- **AND** the footer contains a disclaimer text starting with "Отказ от ответственности:"
