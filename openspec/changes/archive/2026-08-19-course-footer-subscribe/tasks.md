# Tasks: Course footer with second subscribe form + repo links

## Implementation
- [x] Add `.course-footer` CSS to inline `<style>` (dark/emerald band, stacked links)
- [x] Add footer block after module 8: 2nd subscribe button + repo links + back-link
- [x] Wire footer subscribe button (opens modal + pre-checks checkbox)
- [x] Remove `back-link` from module 6 (keep only CTA there)

## Verification
- [x] `openspec validate course-footer-subscribe` passes
- [x] HTML parse: footer last; 2 subscribe buttons; 2 repo links; back-link only in module 1 + footer
- [x] Course CDP test 14/14 PASS (footer doesn't break course)
- [x] CI `test` job green
- [ ] Live check after merge: footer at bottom with subscribe + repo links
