## 1. Baseline and Policy Inputs

- [x] 1.1 Record exact starting `HEAD`, active OpenSpec changes and current tracked-path manifest before implementation; acceptance: evidence names the full SHA and active change IDs.
- [ ] 1.2 Reconcile any diagnosis/roadmap work merged after the recorded baseline before publication; acceptance: complete regression suite is rerun on the final candidate.
- [x] 1.3 Add a machine-readable public path policy matching design disposition; acceptance: all team JSON and generated integration families are forbidden and approved product families are explicit.
- [x] 1.4 Narrow `.gitignore` so real `.env` variants remain forbidden while a sanitized `.env.example` can be tracked; acceptance: placeholder template contains no live credential.

## 2. RED Tests for Quiz v1 Primitives

- [ ] 2.1 Add failing tests for stable `ap-01..ap-31` registry and 62 interleaved question identities; acceptance: duplicates/order drift fail.
- [ ] 2.2 Add failing FNV-1a primitive tests for qv1 domain strings; acceptance: `8K3M` context must equal `0xD121509A`.
- [ ] 2.3 Add failing Mulberry32 primitive tests; acceptance: first five unsigned values equal the normative design vector.
- [ ] 2.4 Add failing Fisher–Yates and RNG-consumption tests; acceptance: modulo/rejection sampling or extra RNG draws fail vectors.
- [ ] 2.5 Add failing complete random golden-vector test for questions, distractors and option source IDs for `8K3M`.
- [ ] 2.6 Add failing fixed-ticket partition/vector tests; acceptance: sizes are `9,9,9,9,9,9,8`, all 62 IDs occur once and ticket 3 matches design.

## 3. RED Tests for URL Grammar

- [ ] 3.1 Add table-driven failing tests for every legal setup/fixed/random parameter combination and canonical serialization order.
- [ ] 3.2 Add failing normalization tests for lowercase seed, explicit `strict=0`, unordered parameters and missing/empty fragment.
- [ ] 3.3 Add failing duplicate-key, missing-qv, empty/non-ASCII seed, invalid decimal and unsupported-version tests.
- [ ] 3.4 Add failing illegal-combination tests for wrong mode fields, lone score/total, result plus autostart and wrong challenge total.
- [ ] 3.5 Add failing relative-versus-absolute URL tests under local root and simulated `/ai-disrupt-pdlc-coach/` base path.
- [ ] 3.6 Add failing invalid-link tests proving no runtime error, no autostart, retained diagnostic URL and zero localStorage mutation.
- [ ] 3.7 Add fragment matrix tests for exact, missing, trailing empty `#`, wrong case, extra `#`, percent-encoded and double-encoded spellings; acceptance: only exact is canonical, missing/empty normalize and every other non-empty fragment invalidates the explicit deeplink.

## 4. Implement Deterministic Quiz Engine

- [ ] 4.1 Refactor question metadata to stable IDs and defer distractor/option generation until challenge construction; acceptance: no import/build-time random pool.
- [ ] 4.2 Implement qv1 FNV-1a, Mulberry32 and Fisher–Yates with exact JavaScript 32-bit semantics; acceptance: primitive vectors pass.
- [ ] 4.3 Implement qv1 random generation with ten questions and exact RNG consumption order; acceptance: full `8K3M` vector passes and `Math.random()` is not called.
- [ ] 4.4 Implement contiguous balanced fixed tickets and fixed domain-separated option RNG; acceptance: partition and ticket 3 vectors pass.
- [ ] 4.5 Update Quiz labels/count copy to actual ticket totals and normalized seeds; acceptance: no text claims every fixed ticket has ten questions.

## 5. Implement URL State and Persistence v2

- [ ] 5.1 Implement allowlisted parser and canonical serializer exactly matching the legal matrix and ordering in design.
- [ ] 5.2 Apply valid noncanonical normalization through `history.replaceState` without reload/storage writes; acceptance: URL and storage assertions pass.
- [ ] 5.3 Apply explicit deeplink presentation before progress rendering and preserve hash-only/no-query behavior.
- [ ] 5.4 Add table-driven RED tests for every v2 top-level, identity and record type/range invariant, unknown keys and one-bad-entry atomic invalidation.
- [ ] 5.5 Implement `aipdlc.quiz.progress.v2` strict schema, exact challenge identities and quarantine of malformed raw data until explicit user reset.
- [ ] 5.6 Add RED update vectors for first, improved, equal, lower and backward-clock completions; acceptance: bestAt/lastAttemptAt follow exact monotonic semantics.
- [ ] 5.7 Derive seven-ticket excellent progress by unique fixed ticket across strict variants; acceptance: random and duplicate strict variants do not inflate denominator.
- [ ] 5.8 Add deterministic eviction vectors with tied timestamps; acceptance: ascending lastAttemptAt then identity order retains exactly 100 random entries and never evicts fixed.
- [ ] 5.9 Preserve `aipdlc.quiz.progress.v1` byte-for-byte and show non-destructive legacy notice; acceptance: legacy fixed/random records receive no qv1 credit.
- [ ] 5.10 Verify malformed v2 completion cannot overwrite raw storage before explicit reset, and reset creates a valid empty v2 store only after user confirmation.

## 6. Implement Share and Result UX

- [ ] 6.1 Add accessible Share Quiz controls to setup and configured challenge states.
- [ ] 6.2 Add Share Result with score/total, calculated percentage and same-challenge canonical URL.
- [ ] 6.3 Implement guarded native-share property access, invocation and await; acceptance: synchronous/asynchronous `AbortError` cancels silently and neither path invokes clipboard.
- [ ] 6.4 Implement synchronous/asynchronous non-cancellation native failure to clipboard fallback with `aria-live` feedback.
- [ ] 6.5 Implement guarded clipboard property access, invocation and await plus focused selectable manual-copy fallback for absence, synchronous throw or rejection.
- [ ] 6.6 Implement validated read-only result card with exact Russian disclosure and `aria-describedby` association.
- [ ] 6.7 Implement result CTA that strips aggregate fields, preserves challenge identity and writes no progress before completion.
- [ ] 6.8 Add privacy assertions proving URLs/payloads contain no name, answers, diagnosis or team data.

## 7. RED Tests and Implementation for Pages Entrypoint

- [x] 7.1 Add failing structural test for `web/index.html` zero-delay relative meta refresh, exact JavaScript replace target and visible fallback link.
- [x] 7.2 Add failing browser test proving root query/hash are discarded and diagnosis is reached under repository subpath.
- [x] 7.3 Implement the tracked entrypoint without hardcoded origin or root-relative path; acceptance: structural and browser tests pass.

## 8. Artifact Policy and Local Publish Gate

- [ ] 8.1 Add failing tests for public tracked-path allowlist and forbidden runtime/generated families.
- [ ] 8.2 Add failing artifact validator tests for unexpected paths, symlinks, hard links, special files and root-absolute/hardcoded origins.
- [ ] 8.3 Implement deterministic web manifest with relative path, mode, size and SHA-256; acceptance: repeated clean runs are byte-identical.
- [ ] 8.4 Add tracked reviewed Gitleaks configuration and pinned linux/amd64 digest/version assertions.
- [ ] 8.5 Implement `publish_gate.py pre-create` exact SHA, clean-state, all-refs/worktree scan, path policy, account, target and remote checks.
- [ ] 8.6 Implement `publish_gate.py pre-push` exact SHA, clean-state, scan/policy recheck, credential-free exact-origin checks and a zero-result requirement for `git ls-remote origin`.
- [ ] 8.7 Emit redacted JSON evidence outside repository with mode `0600`; acceptance: schema contains identities/hashes but no raw finding value.
- [ ] 8.8 Add negative probes for changed HEAD, dirty index, untracked forbidden file, wrong account, wrong remote, stale ref, bad scanner identity and manifest tamper; acceptance: every probe exits non-zero before side effects.
- [ ] 8.9 Implement a fail-closed publication wrapper that sequences pre-create, empty repo creation, state reassertion, origin add, pre-push and exact-SHA push.
- [ ] 8.10 Add dry-run/mocked side-effect tests proving failed pre-create never creates a repository and failed pre-push never pushes source.
- [ ] 8.11 Add an out-of-repository canary finding test proving raw secret text appears in neither redacted evidence nor retained gate logs; securely remove canary after the test.

## 9. Remove Non-Public History

- [x] 9.1 Create an optional local backup bundle outside the repository and record its path without adding a reachable backup ref.
- [ ] 9.2 Remove all eight `coach/data/teams/*.json` paths from index and every reachable public-history ref; acceptance: all-ref path scan returns zero.
- [ ] 9.3 Remove the 31 generated agent directories plus `.github/prompts/**` and `.github/skills/**` from every reachable public-history ref.
- [ ] 9.4 Remove history-rewrite backup/original refs and verify only intended refs are reachable.
- [ ] 9.5 Regenerate/restore the required local Opsx integration only as ignored untracked files and run `openspec status` plus change/all validation; acceptance: Opsx remains usable and public path manifest is unchanged.
- [ ] 9.6 Rerun Gitleaks and independent high-signal scan over all reachable refs and final worktree after cleanup.

## 10. Hardened GitHub Pages Workflow

- [ ] 10.1 Add workflow triggers for push `master` and manual dispatch with explicit `refs/heads/master` guards.
- [ ] 10.2 Pin checkout/configure/upload/deploy actions to the exact full SHAs in design and add tests rejecting moving tags.
- [ ] 10.3 Configure test job `contents: read` only and run Python, jsdom, Chrome/CDP, URL/RNG and reference tests.
- [ ] 10.4 Configure deploy job with exactly `contents: read`, `pages: write`, `id-token: write`, dependency on tests/manifest and `github-pages` concurrency/environment.
- [ ] 10.5 Upload only the validator-approved `web/` artifact and persist its manifest/hash as CI evidence.
- [ ] 10.6 Add workflow negative tests proving wrong ref, failed test, unexpected artifact or manifest mismatch prevents deploy.

## 11. Local Regression and Review Candidate

- [ ] 11.1 Run all Python structural/unit tests and record exact pass/fail counts.
- [ ] 11.2 Run jsdom interaction tests covering share matrix, URL state, result disclosure and storage isolation.
- [ ] 11.3 Run real Chrome/CDP at `390x844`, `744x1133` and `1440x900`; acceptance: zero horizontal overflow and existing header/Quiz interactions pass.
- [ ] 11.4 Verify 12 methodologies, diagnosis/roadmap actions, keyboard, strict mode, restart and no-query progress behavior.
- [ ] 11.5 Audit external HTTPS origins; acceptance: no mixed content, optional visual failures degrade gracefully and jsPDF/html2pdf export paths work or are vendored before release.
- [ ] 11.6 Run `git diff --check`, OpenSpec change/all validation and exact public path/artifact manifests.
- [ ] 11.7 Commit the complete candidate locally and record the full approved SHA; no remote exists yet.
- [ ] 11.8 Obtain two independent GO reviews on that exact SHA: product/spec and delivery/security; any P0/P1 blocks publication.

## 12. Fail-Closed First Publication

- [ ] 12.1 Confirm target availability and authenticated account immediately before wrapper execution.
- [ ] 12.2 Run the publication wrapper against the exact independently approved SHA; acceptance: remote `master` resolves to that SHA and no credential appears in remote URL/logs.
- [ ] 12.3 Configure repository default branch `master` and verify visibility `PUBLIC` through GitHub API.
- [ ] 12.4 Configure `github-pages` environment branch policy to `master` only and verify read-back.
- [ ] 12.5 Enable Pages with GitHub Actions and observe the exact-SHA deployment to terminal `success`.

## 13. Real Public Delivery Verification

- [ ] 13.1 Read back repository, environment, Pages source, workflow run and deployed SHA from GitHub APIs.
- [ ] 13.2 Verify HTTP 200 for root, four pages and every approved artifact-manifest path.
- [ ] 13.3 Compare each decoded public response SHA-256 to the approved manifest; any mismatch is NOT-GO.
- [ ] 13.4 Run 390/744/1440 browser navigation and interaction smoke tests on the actual repository subpath.
- [ ] 13.5 Verify fixed, seeded-random and result links in fresh contexts; acceptance: vectors match and recipient storage remains unchanged.
- [ ] 13.6 Verify invalid/duplicate/unsupported URL inputs fail safely and share fallback works on HTTPS origin.
- [ ] 13.7 Verify no mixed content or failed critical export dependency and update README with verified canonical URL.

## 14. Incident Documentation and Lifecycle

- [x] 14.1 Document credential-first incident response, push freeze, history remediation and non-retractable-copy warning.
- [x] 14.2 Document Pages limits: 1 GB site, 10-minute deployment, 100 GB/month soft bandwidth and custom Actions build-limit distinction.
- [ ] 14.3 Obtain final independent delivery GO after public byte/browser verification; resolve every P0/P1.
- [ ] 14.4 Reconcile task evidence, rerun OpenSpec validation and commit implementation separately from lifecycle bookkeeping.
- [ ] 14.5 Archive `github-pages-quiz-sharing` only through official OpenSpec command after real delivery passes.
- [ ] 14.6 Verify archived specs, clean Git state, remote SHA and final public URL before reporting completion.
