# web-course-ui Specification (delta)

## ADDED Requirements

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
