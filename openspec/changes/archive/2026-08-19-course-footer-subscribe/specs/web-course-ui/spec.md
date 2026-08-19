# web-course-ui Specification (delta)

## ADDED Requirements

### Requirement: Course has a footer at the very bottom
`web/course-openspec.html` SHALL render a `.course-footer` block as the last
element of the page (after module 8), containing a second newsletter opt-in and
repository links. The footer (not an inline CTA) is the page terminus.

#### Scenario: Footer is the last block
- **WHEN** the course page renders
- **THEN** a `.course-footer` element exists after module 8 and contains the back-link, a subscribe button, and repo links

### Requirement: Footer repeats the subscribe action
The course footer SHALL offer a second newsletter opt-in (button that opens the
contact modal with the newsletter checkbox pre-checked), so the reader can
subscribe at the end of the page without scrolling back up.

#### Scenario: Footer subscribe opens modal pre-checked
- **WHEN** the reader clicks the footer subscribe button
- **THEN** the contact modal opens with `contact-newsletter` checked

### Requirement: Footer links to official repos
The course footer SHALL link to the official OpenSpec repository
(https://github.com/Fission-AI/openspec) and the site repository
(https://github.com/xsa-dev/ai-disrupt-pdlc-coach).

#### Scenario: Repo links present in footer
- **WHEN** the footer renders
- **THEN** it contains anchor links to both repositories
