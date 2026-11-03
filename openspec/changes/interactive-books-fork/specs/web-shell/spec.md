# web-shell Specification Delta

## ADDED Requirements

### Requirement: Methodology books fork integration on all pages
Every published page (`diagnosis.html`, `roadmap.html`, `methodologies.html`, `antipatterns.html`, `openspec.html`, `course-openspec.html`, `glossary.html`, and `index.html`) SHALL load and initialize the unobtrusive methodology books fork component (`books-fork-modal.js` and `books-fork-modal.css`).

1. The page SHALL include `<link rel="stylesheet" href="books-fork-modal.css">` and `<script src="books-fork-modal.js" defer></script>`.
2. The page SHALL render the persistent bottom-left floating chip trigger without visual collision with the right-side author FAB or book assistant launcher at all breakpoints down to 360px.
3. On content pages rendering the shared site footer (`diagnosis.html`, `roadmap.html`, `methodologies.html`, `antipatterns.html`, `openspec.html`, `course-openspec.html`, `glossary.html`), the footer guide block (`.site-footer__guide`) SHALL additionally offer a complementary semantic button trigger `<button type="button" class="site-footer__fork-btn" data-books-fork-trigger aria-haspopup="dialog" aria-controls="books-fork-dialog">` opening the methodology fork dialog for users reaching the bottom of the page.
4. On `index.html` (which is a fast redirect stub without a site footer), the script SHALL execute safely without errors or unhandled null references.

#### Scenario: User visits any page and accesses the books fork from floating trigger
- **WHEN** the user opens any of the eight published pages
- **THEN** the books fork floating trigger is rendered in the bottom-left area
- **AND** clicking the trigger opens the interactive split dialog containing links to `https://aipdlc.ru/ru/pslc` and `https://aipdlc.ru/ru/vibeppm`
- **AND** the page produces zero horizontal overflow at 390px, 744px, and 1200px viewports

#### Scenario: User accesses books fork from the page footer
- **WHEN** the user navigates to the footer of any of the seven content pages (`diagnosis.html`, `roadmap.html`, `methodologies.html`, `antipatterns.html`, `openspec.html`, `course-openspec.html`, `glossary.html`)
- **THEN** the `.site-footer__guide` element contains a complementary button trigger with `data-books-fork-trigger`
- **AND** activating this trigger opens the interactive split dialog
- **AND** dismissing the dialog returns keyboard focus to the footer trigger button
