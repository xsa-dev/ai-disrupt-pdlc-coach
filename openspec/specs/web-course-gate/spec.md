# web-course-gate Specification

## Purpose
TBD - created by archiving change course-gamification. Update Purpose after archive.
## Requirements
### Requirement: Course entry is gated by interest behavior
The site SHALL hide direct entry to `course-openspec.html` until the visitor has (a) spent at least **20 seconds** (configurable minimum) on the OpenSpec section (`openspec.html`) while the tab is visible, and (b) triggered an explicit "interested" signal (a "Мне интересно" button).

#### Scenario: Locked by default
- **WHEN** a visitor with no `courseAccess` flag opens `openspec.html`
- **THEN** the course entry SHALL be shown in a locked/disabled state

#### Scenario: Early click is ignored
- **WHEN** the visitor clicks "Мне интересно" before spending ≥20s visible on `openspec.html`
- **THEN** the course SHALL remain locked and the click SHALL be ignored (no unlock)

#### Scenario: Both conditions unlock
- **WHEN** the visitor has been visible on `openspec.html` for ≥20s AND clicks "Мне интересно"
- **THEN** the course entry SHALL become unlocked and navigable

### Requirement: Unlock persists in the browser
Once unlocked, the state SHALL be stored via `localStorage` with a `try/catch` guard (`courseAccess=unlocked`) so the gate does not repeat on the same browser. If `localStorage` is unavailable (some in-app WebViews disable it), the unlock SHALL fall back to an in-session flag so the gate still opens during the visit.

#### Scenario: Return visit stays unlocked
- **WHEN** the visitor later opens `openspec.html` with `courseAccess=unlocked` set
- **THEN** the course entry SHALL be immediately available (no re-gate)

#### Scenario: WebView without localStorage
- **WHEN** `localStorage` access throws (Telegram/Threads WebView restricts storage)
- **THEN** unlock SHALL fall back to an in-session variable and the course SHALL still open for the current visit

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

