# contact-author Specification Delta

## ADDED Requirements

### Requirement: Flip-card modal displays methodology guide link and disclaimer
The contact flip-card dialog SHALL include:
1. A direct link to the official methodology guide «Руководство по генеративной разработке ПО (PDF) →» (`https://aipdlc.ru/documents/ru/whitepaper_full_ru.pdf`, `target="_blank"`, `rel="noopener"`).
2. Explicit attribution on the card clarifying that the AI-Disrupt PDLC methodology is sourced from `aipdlc.ru` (Сбербанк), while this interactive website was developed by xsa-dev.
3. An explicit disclaimer stating the advisory nature of the site's diagnostics and content.

#### Scenario: User opens modal and views methodology link and attribution
- **WHEN** the user opens the contact dialog on any page
- **THEN** the modal displays a link to `https://aipdlc.ru/documents/ru/whitepaper_full_ru.pdf`
- **AND** the card displays explicit attribution distinguishing the methodology author from the site developer
- **AND** the card presents an explicit disclaimer
