# web-course-ui Specification (delta)

## ADDED Requirements

### Requirement: Inline code stays inline on mobile
`web/course-openspec.html` SHALL render inline `<code>` (inside prose, callouts,
cards, subtitles) as `display: inline` with `white-space: normal`, so commands
like `/opsx:explore` flow as normal text instead of breaking into vertical
letter stacks on narrow viewports. Code blocks (`.translation-code pre code`,
`.bug-line code`) are excluded and keep their block/monospace layout.

#### Scenario: Command in callout readable on mobile
- **WHEN** the course loads at 390px width
- **THEN** `/opsx:explore` in the "Как начать" callout renders inline (not letter-by-letter) and the callout does not force horizontal overflow

### Requirement: Callout does not collapse inline code
The `.callout` container in the course SHALL use `display: block` (overriding the
skill's `display: flex`) so its inline `<code>` children are not squeezed by flex
layout on narrow screens.

#### Scenario: Callout layout on mobile
- **WHEN** a `.callout` with inline code renders at 390px
- **THEN** the inline code width is not collapsed to near-zero and text remains readable
