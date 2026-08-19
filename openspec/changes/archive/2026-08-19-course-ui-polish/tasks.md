# Tasks: Course UI Polish

## Implementation
- [x] Move course CTA block in `web/openspec.html` from end of `<main>` to top (after `<main>` open, before `<h1>`)
- [x] Add `:root` CSS-variable override in `web/course-openspec.html` inline `<style>` (emerald accent, slate text/border, system fonts, emerald-tinted hero bg)
- [x] Verify `web/course-openspec/styles.css` is NOT modified (override only via page `:root`)

## Verification
- [x] Local render: course CTA visible at top of `openspec.html`
- [x] Local render: course page accent is emerald, not vermillion
- [x] `openspec validate course-ui-polish` passes
- [x] CI `test` job stays green (header/viewport/artifact tests unaffected)
- [x] Live check after merge: `course-openspec.html` uses emerald palette; `openspec.html` shows CTA above heading
