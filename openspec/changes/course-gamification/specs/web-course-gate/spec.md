# web-course-gate Specification (delta)

## ADDED Requirements

### Requirement: Course entry is gated by interest behavior
The site SHALL hide direct entry to `course-openspec.html` until the visitor has (a) spent at least a configurable minimum time on the OpenSpec section (`openspec.html`) and (b) triggered an explicit "interested" signal (e.g. a "Мне интересно" button).

#### Scenario: Locked by default
- **WHEN** a visitor with no `courseAccess` flag opens `openspec.html`
- **THEN** the course entry SHALL be shown in a locked/disabled state

#### Scenario: Both conditions unlock
- **WHEN** the visitor has been on `openspec.html` for ≥ the minimum time AND clicks "Мне интересно"
- **THEN** the course entry SHALL become unlocked and navigable

### Requirement: Unlock persists in the browser
Once unlocked, the state SHALL be stored in `localStorage` (`courseAccess=unlocked`) so the gate does not repeat on the same browser.

#### Scenario: Return visit stays unlocked
- **WHEN** the visitor later opens `openspec.html` with `courseAccess=unlocked` set
- **THEN** the course entry SHALL be immediately available (no re-gate)

### Requirement: Locked course page redirects with guidance
If `course-openspec.html` is opened without the unlock flag, it SHALL show a "locked" notice with a call-to-action back to the OpenSpec section.

#### Scenario: Direct deep-link while locked
- **WHEN** `course-openspec.html` loads without `courseAccess=unlocked`
- **THEN** it SHALL display a locked screen with a CTA to the OpenSpec section

### Requirement: Unlock is celebrated with animation
When the gate is satisfied, the transition into the course SHALL include an unlock animation (e.g. seal break / reveal) as positive reinforcement.

#### Scenario: Celebration on unlock
- **WHEN** the unlock condition is first met
- **THEN** an unlock animation SHALL play before or during navigation to the course
