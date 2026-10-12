# web-glossary Specification

## Purpose
Предоставить пользователям сайта Disrupt PDLC Coach интерактивный двуязычный глоссарий терминов AI-Disrupt PDLC с полнотекстовым поиском, системой закладок и пермалинками.

## ADDED Requirements

### Requirement: Multilingual glossary data and rendering
The glossary SHALL render terms defined in `web/glossary-data.js` containing both Russian (RU) and English (EN) titles, definitions, context descriptions, categories/tags, and search aliases.

#### Scenario: User switches language
- **WHEN** the user selects the language toggle (RU or EN)
- **THEN** all rendered term cards update their titles, definitions, and context descriptions to the selected language
- **AND** the choice is persisted in `localStorage` under `aipdlc.glossary.lang.v1`

### Requirement: Fulltext search with highlighting
The glossary SHALL provide an instant fulltext search input that filters terms matching title, aliases, definition, or context in real time.

#### Scenario: User types a search query
- **WHEN** the user types text into the search input
- **THEN** only terms matching the query in either Russian or English (or aliases) remain visible
- **AND** matching terms display count feedback
- **AND** if no terms match, an empty-state message is displayed

### Requirement: Bookmark management
Each glossary term card SHALL provide a toggleable bookmark control allowing users to pin favorite terms.

#### Scenario: User bookmarks a term
- **WHEN** the user clicks the bookmark icon on a term card
- **THEN** the term's bookmarked state toggles visually
- **AND** the state is persisted in `localStorage` under `aipdlc.glossary.bookmarks.v1`
- **AND** the bookmarks counter updates

#### Scenario: User filters by bookmarks
- **WHEN** the user clicks the "Только закладки" filter toggle
- **THEN** only bookmarked terms remain visible

### Requirement: Permalinks and deep linking
Each term SHALL have a unique anchor identifier (`#term-<id>`). Clicking the term title or permalink icon SHALL update the browser URL hash and copy the link.

#### Scenario: User opens glossary with anchor hash
- **WHEN** the page loads with a hash matching `#term-<id>`
- **THEN** the corresponding term card is scrolled into view and highlighted
