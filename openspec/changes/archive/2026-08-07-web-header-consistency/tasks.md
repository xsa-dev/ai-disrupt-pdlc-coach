## 1. Contract and RED Evidence

- [x] 1.1 Add a structural regression test covering all four pages, exact navigation order, one `aria-current`, shared container classes, brand-row geometry, title, subtitle, and unique IDs. Acceptance: the test fails against the pre-change HTML for documented header inconsistencies.

## 2. Shared Header Implementation

- [x] 2.1 Replace the diagnosis header with the shared semantic two-row contract. Acceptance: diagnosis is active and the brand row uses shared geometry.
- [x] 2.2 Replace the roadmap header with the shared semantic two-row contract. Acceptance: Roadmap is active and existing page actions remain reachable.
- [x] 2.3 Replace the methodologies header with the shared semantic two-row contract. Acceptance: the missing brand row is added without duplicating the page hero.
- [x] 2.4 Replace the antipatterns header with the shared semantic two-row contract. Acceptance: Антипаттерны is active and quiz/navigation actions remain reachable.

## 3. Automated Verification

- [x] 3.1 Run header contract tests and existing page regressions. Acceptance: all suites pass with no duplicate IDs or syntax failures.
- [x] 3.2 Add/run a real-Chrome viewport probe at 390 and 744 CSS px for all four pages. Acceptance: document overflow is zero and header geometry matches within each viewport.

## 4. Visual and Delivery QA

- [x] 4.1 Capture and inspect desktop and mobile screenshots for all four pages. Acceptance: nav/header boundaries and vertical rhythm no longer jump; no clipping is visible.
- [x] 4.2 Check browser console and navigation on the live preview. Acceptance: four routes render and page links resolve without runtime errors.
- [x] 4.3 Verify the active public quick-tunnel URLs against local files. Acceptance: each route returns HTTP 200 and byte parity passes.

## 5. Review and Lifecycle

- [x] 5.1 Run blocking implementation review and `git diff --check`. Acceptance: review verdict GO with no P0/P1 issues.
- [x] 5.2 Validate OpenSpec, mark only evidenced tasks complete, commit implementation, archive via `openspec archive web-header-consistency -y`, validate the store, and commit lifecycle changes. Acceptance: Git tree is clean and change is no longer active.
