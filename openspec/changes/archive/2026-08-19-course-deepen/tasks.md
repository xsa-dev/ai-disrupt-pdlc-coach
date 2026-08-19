# Tasks: Deepen the OpenSpec course

## Implementation
- [x] Override `--color-bg-code` to Darcula `#282a36` in course inline `<style>`
- [x] Add Darcula syntax-highlight CSS (`.code-keyword/#CC7832`, `.code-string/#6A8759`, `.code-comment/#808080`, `.code-num/#6897BB`, `.code-punc/#A9B7C6`)
- [x] Apply highlight spans to existing code blocks in module 1 and module 3 (delta spec)
- [x] Add Module 7 "Архив на практике" (theory + quiz)
- [x] Add Module 8 "Пиши хорошие scenarios" (theory + quiz, vague vs concrete contrast)
- [x] Add extra quiz to Module 3 (ADDED vs MODIFIED vs REMOVED)

## Verification
- [x] `openspec validate course-deepen` passes
- [x] Local CDP: code block bg = rgb(40,42,54); a keyword span uses Darcula orange
- [x] New modules render (7 + 8); quizzes present (module3b, 7, 8)
- [x] Course CDP test 14/14 PASS (was 8/8)
- [x] CI `test` job green (course CDP + header/viewport tests unaffected)
- [ ] Live check after merge: Darcula code blocks + 2 new modules + extra quiz visible
