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

### Requirement: Course code blocks use Darcula palette with syntax highlighting
`web/course-openspec.html` SHALL render code blocks using the Darcula
(IntelliJ) palette — background `#282a36`, base text `#A9B7C6`, with syntax
highlight classes: keywords `#CC7832`, strings `#6A8759`, comments `#808080`,
numbers `#6897BB`. Syntax-highlight spans SHALL be applied to code content.

#### Scenario: Code block shows Darcula colors
- **WHEN** a code block (`.translation-code` / `pre`) renders
- **THEN** its background resolves to `#282a36` and keyword/string/comment tokens use the Darcula colors above

### Requirement: Course covers archive mechanics in practice
`web/course-openspec.html` SHALL include a module explaining what actually
happens on archive: delta specs merge into `openspec/specs/`, and the change
folder moves to `openspec/changes/archive/YYYY-MM-DD-<name>/`.

#### Scenario: Learner reads the archive module
- **WHEN** the learner reaches the archive module
- **THEN** it states that archive folds delta into the source of truth and timestamps the change folder

### Requirement: Course teaches writing good scenarios
`web/course-openspec.html` SHALL include a module on writing strong
GIVEN/WHEN/THEN scenarios, including the anti-pattern of vague requirements
(e.g. "handle gracefully") and the fix of observable, concrete scenarios.

#### Scenario: Learner studies scenario quality
- **WHEN** the learner reaches the scenarios module
- **THEN** it contrasts a vague requirement with a concrete GIVEN/WHEN/THEN example

### Requirement: Course provides additional quizzes for deeper retention
`web/course-openspec.html` SHALL include at least one extra multiple-choice
quiz beyond the baseline (specifically reinforcing delta-spec ADDED/MODIFIED/
REMOVED semantics), plus quizzes in the new archive and scenarios modules.

#### Scenario: Extra quiz present on delta module
- **WHEN** the learner reviews the delta-spec module
- **THEN** a quiz reinforces when to use ADDED vs MODIFIED vs REMOVED

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

### Requirement: Contact modal offers newsletter opt-in
`web/contact-modal.js` SHALL render an optional checkbox `id="contact-newsletter"` (label "Хочу получать рассылку") inside the modal body, after the message field. When the user submits, the payload SHALL include `newsletter: "yes"` if checked, else `newsletter: "no"`.

#### Scenario: User opts into newsletter
- **WHEN** the user checks "Хочу получать рассылку" and sends the form
- **THEN** the submitted payload contains `newsletter: "yes"`

### Requirement: Course ends with a newsletter CTA
`web/course-openspec.html` SHALL display a call-to-action block after module 8 (before the back-link) inviting the reader to subscribe. Activating it SHALL open the contact modal with the newsletter checkbox pre-checked.

#### Scenario: Reader subscribes from course end
- **WHEN** the reader clicks the course-end newsletter CTA
- **THEN** the contact modal opens and `contact-newsletter` is checked

