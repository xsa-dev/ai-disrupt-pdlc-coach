# web-mobile-inapp Specification (delta)

## ADDED Requirements

### Requirement: Viewport supports in-app browser safe areas
All site pages SHALL declare `viewport-fit=cover` so content can extend under the system bars of in-app browsers (Threads, Telegram WebView).

#### Scenario: Viewport meta on every page
- **WHEN** any `web/*.html` page is served
- **THEN** its viewport meta SHALL include `viewport-fit=cover`

### Requirement: Content respects safe-area insets
The site SHALL apply `env(safe-area-inset-*)` padding/margins to root containers, fixed nav, modals, and footers so they are not hidden behind the in-app browser toolbar or home indicator.

#### Scenario: Fixed contact modal clears the home indicator
- **WHEN** the contact modal is open in an in-app browser
- **THEN** it SHALL sit above `env(safe-area-inset-bottom)` and not be clipped by the home indicator

### Requirement: Full-height blocks use dynamic viewport units
Full-height blocks (hero, modal surfaces, sticky panels) SHALL declare `100vh` first and then `100dvh` so older engines fall back gracefully while in-app browsers use the dynamic value.

#### Scenario: Modal height fits the visible area
- **WHEN** a full-screen or fixed surface is rendered in an in-app browser
- **THEN** its height SHALL be based on `100dvh` (with `100vh` as fallback)

#### Scenario: Fallback on legacy engines
- **WHEN** a browser does not support `dvh`
- **THEN** the block SHALL still render using the `100vh` fallback

### Requirement: Tap targets meet minimum size
Primary interactive controls (nav links, buttons, FAB) SHALL have a minimum tap target of 44×44 CSS px so they are usable without a cursor.

#### Scenario: Nav link tap target
- **WHEN** the site is viewed on a narrow viewport (any width ≤480px)
- **THEN** each top-nav link SHALL be at least 44px tall and 44px wide

### Requirement: Interactions work without hover
Interactive elements SHALL be operable by tap/click alone; hover-only affordances SHALL have a visible tap/active state.

#### Scenario: Button usable without hover
- **WHEN** a user taps a button in an in-app browser (no hover)
- **THEN** the button SHALL show a pressed/active state and trigger its action
