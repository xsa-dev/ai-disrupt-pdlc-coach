# web-course-contacts Specification (delta)

## ADDED Requirements

### Requirement: Course footer links to email, GitHub, Telegram
The course footer SHALL provide static links to contact the author: an email (`mailto:`), the project GitHub repository, and a Telegram deep-link with a pre-filled greeting.

#### Scenario: Footer has all three channels
- **WHEN** the course footer is rendered
- **THEN** it SHALL contain a `mailto:` link, a GitHub repository link, and a Telegram link whose `href` includes `?text=` with a greeting

### Requirement: Newsletter subscription removed
The course SHALL NOT contain a newsletter signup form (no `course-newsletter-btn`, no `course-footer-subscribe-btn`) that posts to Formspree.

#### Scenario: No subscription form
- **WHEN** `course-openspec.html` is rendered
- **THEN** there SHALL be no element with id `course-newsletter-btn` or `course-footer-subscribe-btn`
