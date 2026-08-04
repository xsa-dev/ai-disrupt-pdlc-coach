## 1. MVP Approval and Source Contract

- [ ] 1.1 Approve the five product decisions in `design.md` Open Questions before implementation begins (AC: page name, URL, 12-entry list, inline details, and template scope are explicitly accepted or updated; dependency: none)
- [ ] 1.2 Verify the source map for all 12 entries against the whitepaper text/PDF and record exact section references (AC: every entry has at least one verified section and no unsupported normative claim; dependency: 1.1)
- [ ] 1.3 Define the final registry data, taxonomy, lifecycle stages, and exact related-antipattern names (AC: 12 unique IDs; all mandatory fields populated; every antipattern name exists in the current registry; dependency: 1.2)

## 2. Regression Tests First

- [ ] 2.1 Add a source/data-integrity test for entry count, IDs, kinds, mandatory fields, source sections, and antipattern references (AC: test fails before the page/registry exists and covers every data contract; dependency: 1.3)
- [ ] 2.2 Add static HTML checks for duplicate IDs, internal navigation targets, viewport metadata, and inline JavaScript syntax (AC: checks are reproducible from the repository and initially fail for the missing page/links; dependency: 1.1)
- [ ] 2.3 Add headless interaction checks for lifecycle/type filters, reset, detail controls, and keyboard activation (AC: test demonstrates RED state before implementation; dependency: 2.1)
- [ ] 2.4 Add an iPad mini viewport check at 744 CSS pixels (AC: test detects horizontal document overflow and inaccessible controls; dependency: 2.2)

## 3. Methodologies Page

- [ ] 3.1 Create `web/methodologies.html` with shared fonts, Tailwind/Font Awesome resources, emerald visual language, semantic navigation, hero, and lifecycle map (AC: page loads locally without console or resource-blocking errors; dependency: 2.2)
- [ ] 3.2 Implement the single JavaScript registry with the approved 12 source-grounded entries (AC: source/data-integrity test passes; dependency: 1.3, 3.1)
- [ ] 3.3 Render taxonomy labels, compact cards, and complete inline detail panels from the registry (AC: every card exposes all required fields without duplicated content; dependency: 3.2)
- [ ] 3.4 Implement combinable lifecycle/type filters and «Все» reset without page reload (AC: filter interaction and selected-state tests pass; dependency: 3.2)
- [ ] 3.5 Implement keyboard behavior, focus visibility, ARIA/state semantics, and collapsed-by-default details (AC: keyboard test passes without a mouse; dependency: 3.3, 3.4)
- [ ] 3.6 Polish responsive layout for phone and iPad mini portrait/landscape (AC: no horizontal document overflow at 744 CSS pixels and controls remain operable; dependency: 3.3, 3.4)

## 4. Cross-Section Integration

- [ ] 4.1 Add the «Методики» navigation item to diagnosis, roadmap, antipatterns, and methodologies pages with correct active state (AC: all four pages have working reciprocal navigation and no duplicate IDs; dependency: 3.1)
- [ ] 4.2 Add the Diagnosis → Roadmap → Methodologies → Antipatterns context block and working Roadmap/Antipattern links (AC: internal-link checks pass and browser navigation reaches the intended pages; dependency: 4.1)
- [ ] 4.3 Render related antipattern names only from the validated registry mapping (AC: no broken or invented antipattern reference is present; dependency: 1.3, 3.3)

## 5. Verification and Delivery

- [ ] 5.1 Run OpenSpec validation plus all source, static, JavaScript, interaction, keyboard, and responsive regression tests (AC: every command exits zero; dependency: 2.1–4.3)
- [ ] 5.2 Perform manual browser QA of the main journey and inspect console output at desktop and iPad mini viewports (AC: no uncaught JavaScript errors, clipped required content, or unusable controls; dependency: 5.1)
- [ ] 5.3 Run an independent blocking review against proposal, spec, design, source map, and implementation (AC: verdict is GO or every blocking finding is fixed and re-reviewed; dependency: 5.2)
- [ ] 5.4 Publish through the existing Cloudflare quick tunnel and verify the exact public page with HTTP 200 and content parity against localhost (AC: verified public URL and byte/content comparison are recorded; dependency: 5.3)
- [ ] 5.5 Mark tasks complete only from verification evidence, re-run `openspec validate web-methodologies --type change`, and archive through `openspec archive` after all acceptance criteria pass (AC: change is valid and archive command succeeds without validation bypass; dependency: 5.1–5.4)
