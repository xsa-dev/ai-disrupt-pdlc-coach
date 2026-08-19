# Tasks: Fix mobile callout/inline-code breakage

## Implementation
- [x] Add `code:not(pre code):not(.bug-line code):not(.code-line) { display:inline; white-space:normal; width:auto }` to course inline `<style>`
- [x] Add `.callout { display: block !important; }` override

## Verification
- [x] Local CDP @390px: inline `<code>` computed `display:inline`, width ~125-259px (not 10px), `white-space:normal`
- [x] Course CDP test 14/14 still PASS (translation/pre code blocks unaffected)
- [x] `openspec validate course-callout-mobile-fix` passes
- [x] CI `test` job green
- [ ] Live check after merge: callout commands readable inline on mobile
