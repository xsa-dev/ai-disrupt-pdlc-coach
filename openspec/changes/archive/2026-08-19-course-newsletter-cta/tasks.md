# Tasks: Newsletter opt-in via contact modal + course CTA

## Implementation
- [x] contact-modal.js: add `newsletter` checkbox + label after message field
- [x] contact-modal.js: include `newsletter` in `focusables`
- [x] contact-modal.js: sendBtn payload includes `newsletter: 'yes'|'no'`
- [x] course-openspec.html: add newsletter CTA block after module 8 (opens modal + pre-checks checkbox)
- [x] course-openspec.html: wire contact-modal.js + contact-modal.css (was missing on course page)

## Verification
- [x] `openspec validate course-newsletter-cta` passes
- [x] Local CDP: checkbox renders; CTA opens modal + pre-checks; payload newsletter:yes
- [x] Course CDP test 14/14 PASS (contact-modal wiring didn't break course)
- [x] CI `test` job green
- [ ] Live check after merge: checkbox in modal; CTA in course pre-checks it
