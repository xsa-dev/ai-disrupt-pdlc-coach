# web-mobile-bugfix Specification

## Purpose
TBD - created by archiving change web-mobile-bugfix. Update Purpose after archive.
## Requirements
### Requirement: Nav items are visually separated
The top navigation links SHALL have an explicit right padding (≥12px) and must not shrink, so labels are not visually joined and are not clipped at the viewport edge in in-app browsers.

#### Scenario: Nav labels not joined
- **WHEN** the site is viewed at ≤480px width
- **THEN** each `.site-nav-link` SHALL have visible spacing (padding-right ≥ 0.75rem) and `flex-shrink: 0`

### Requirement: Button labels do not wrap
Interactive button labels (`.btn`, chat controls) SHALL stay on a single line (`white-space: nowrap`) and SHALL NOT shrink below content width.

#### Scenario: Chat "next step" button
- **WHEN** the course chat control "Следующий шаг" renders at ≤480px
- **THEN** its label SHALL remain on one line inside the button (no mid-word wrap)

