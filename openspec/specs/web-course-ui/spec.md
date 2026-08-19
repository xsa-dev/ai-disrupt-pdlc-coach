# web-course-ui Specification

## Purpose
TBD - created by archiving change course-ui-polish. Update Purpose after archive.
## Requirements
### Requirement: Course CTA above the fold on the OpenSpec section page
`web/openspec.html` SHALL present the call-to-action block linking to the
interactive course (`course-openspec.html`) immediately after the opening
`<main>` element and before the "Разработка через OpenSpec" heading, so the
entry to the course is visible without scrolling.

#### Scenario: Visitor lands on the OpenSpec section page
- **WHEN** `web/openspec.html` loads
- **THEN** the course CTA ("Хочешь понять OpenSpec на практике?") appears at the top of `<main>`, above the page heading and theory content

### Requirement: Course re-skinned to site palette
`web/course-openspec.html` SHALL use the main site's visual language — emerald
accent (`#059669`/`#047857`), slate text and borders, and system UI fonts —
by overriding the copied skill design-system CSS custom properties, instead of
the skill's default warm/vermillion palette and display fonts.

#### Scenario: Course matches site colors
- **WHEN** the course page renders
- **THEN** accent color resolves to emerald (not vermillion `#D94F30`), body text uses slate, and headings use the system-ui font family

### Requirement: Course design system untouched at source
The re-skin SHALL be achieved by overriding CSS custom properties (`:root`
variables) in the page's inline `<style>`, leaving `web/course-openspec/styles.css` (the copied skill engine) unmodified.

#### Scenario: Skill stylesheet remains verbatim
- **WHEN** a reviewer diffs `web/course-openspec/styles.css` against the skill source
- **THEN** the file is unchanged except for intentional palette overrides applied via page-level `:root`

