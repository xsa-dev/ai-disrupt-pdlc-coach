# github-pages-delivery Specification

## Purpose
TBD - created by archiving change github-pages-quiz-sharing. Update Purpose after archive.
## Requirements
### Requirement: Public history follows an explicit allowlist
Before first public push, the project SHALL remove all `coach/data/teams/*.json`, all 31 generated agent integration directories, `.github/prompts/**` and `.github/skills/**` from every reachable public-history ref. The public tracked path set SHALL be restricted to the allowlist defined in design; runtime assessments, credentials, env files, dependencies, caches, PDFs, gate reports and local generated integrations SHALL be forbidden.

#### Scenario: Candidate history contains private or local-only paths
- **WHEN** any reachable ref contains a forbidden team assessment or generated integration path
- **THEN** publication is blocked
- **AND** the path is removed from reachable public history before the complete gate is rerun

#### Scenario: Public allowlist is approved
- **WHEN** the candidate commit and all reachable refs contain only approved public paths
- **THEN** the path-policy check passes
- **AND** its deterministic manifest hash is recorded in redacted gate evidence

### Requirement: Publish gate is mechanically fail-closed
The implementation SHALL provide an executable gate with `pre-create` and `pre-push` modes. Both modes SHALL require an exact approved full commit SHA, clean repository state, approved path set, full-history/worktree secret scan, expected GitHub account, expected remote state and a validated static artifact manifest. Every mismatch SHALL exit non-zero before subsequent public side effects.

#### Scenario: Approved state is unchanged
- **WHEN** `HEAD`, clean state, refs, paths, account, target and artifact all match the approved inputs
- **THEN** the mode emits a redacted machine-readable pass report outside the repository
- **AND** the report identifies the approved SHA, policy hash, scanner identity and manifest hash

#### Scenario: State changes after approval
- **WHEN** `HEAD`, index, worktree, refs, paths, account, target, remote or artifact differs from approved state
- **THEN** the gate exits non-zero
- **AND** repository creation or push does not run

### Requirement: Secret scanner is immutable and verified
The gate SHALL scan all reachable refs and the final worktree with Gitleaks 8.30.1 using the Linux amd64 image digest `sha256:b109bc5f8f76a38196a3e413704fc5b9e3c32360bce4e4b603bd6f45b3721dbb` and a tracked reviewed configuration. Evidence SHALL redact secret values.

#### Scenario: Scanner identity matches
- **WHEN** the gate starts a scan
- **THEN** it verifies the image digest and exact Gitleaks version before trusting results
- **AND** scans all reachable refs plus final worktree

#### Scenario: Secret is detected
- **WHEN** the pinned scanner reports any finding not covered by a reviewed non-secret allowlist
- **THEN** the gate fails
- **AND** no raw secret value is copied into persistent evidence

#### Scenario: Redaction canary is exercised
- **WHEN** a temporary canary secret triggers the negative scanner path
- **THEN** its raw value appears in neither evidence nor retained gate logs
- **AND** the canary is outside repository history and removed after the test

### Requirement: Public repository creation and push are bound to one approved SHA
The public repository SHALL be `xsa-dev/ai-disrupt-pdlc-coach`. A fail-closed wrapper SHALL run `pre-create`, create an empty public repository without source push, reassert unchanged state, add a credential-free origin, run `pre-push`, and push exactly the approved SHA to `refs/heads/master`.

#### Scenario: First publication succeeds
- **WHEN** both gate modes pass for the same approved SHA
- **THEN** GitHub reports the repository as public
- **AND** `origin` contains no embedded credentials
- **AND** remote `master` resolves to the approved SHA

#### Scenario: Pre-push recheck fails
- **WHEN** repository creation succeeded but `pre-push` fails, including when `git ls-remote origin` reports any ref
- **THEN** no source commit is pushed
- **AND** the empty repository is left for explicit inspection rather than bypassing the failure

#### Scenario: Local Opsx integration is restored after history cleanup
- **WHEN** generated integration history has been removed
- **THEN** the required Opsx integration is regenerated/restored only as ignored untracked local files
- **AND** `openspec status` and validation pass without those files entering the public manifest

### Requirement: Pages workflow uses immutable dependencies and branch restrictions
The Pages workflow SHALL trigger only for publication from `master`; manual runs from any other ref SHALL fail or skip before deployment. The `github-pages` environment SHALL allow only `master`. Official actions SHALL be pinned to the full commit SHAs recorded in design, and dependency updates SHALL require review.

#### Scenario: Master deployment is requested
- **WHEN** a push to `master` or manual dispatch on `master` runs the workflow
- **THEN** checkout uses the triggering immutable commit
- **AND** tests and artifact validation run before deployment

#### Scenario: Manual dispatch uses another ref
- **WHEN** workflow dispatch is started from a ref other than `refs/heads/master`
- **THEN** no Pages artifact is deployed
- **AND** no write-scoped deployment job proceeds

### Requirement: Workflow permissions are least privilege
The test/manifest job SHALL have `contents: read` only. The deployment job SHALL depend on successful tests and manifest validation, SHALL have exactly `contents: read`, `pages: write` and `id-token: write`, and SHALL use the `github-pages` environment and deployment concurrency. No repository secret SHALL be required.

#### Scenario: Test or manifest validation fails
- **WHEN** any prerequisite test, path audit or manifest check fails
- **THEN** the deployment job does not run

#### Scenario: Deployment job starts
- **WHEN** every prerequisite passes on `master`
- **THEN** only the documented job-level permissions are available
- **AND** no long-lived deployment credential is read

### Requirement: Pages artifact contains only validated static files
The workflow SHALL deploy only validated `web/` bytes. The artifact validator SHALL reject symlinks, hard links, special files, root-absolute first-party references, hardcoded preview/production origins and paths not present in the reviewed artifact policy. It SHALL produce a sorted manifest of relative path, mode, byte size and SHA-256.

#### Scenario: Valid artifact is assembled
- **WHEN** every `web/` path is a regular approved file and references are subpath-safe
- **THEN** the artifact manifest is generated deterministically
- **AND** only those bytes are uploaded to Pages

#### Scenario: Unexpected path or link is present
- **WHEN** `web/` contains an unexpected file, symlink, hard link or special file
- **THEN** artifact validation fails
- **AND** no Pages upload occurs

### Requirement: Stable project-site entrypoint has deterministic redirect behavior
The published base URL SHALL return HTTP 200 from a tracked `web/index.html`, then replace the location with relative `diagnosis.html`. The entrypoint SHALL use zero-delay relative meta refresh, JavaScript `location.replace` and an accessible visible fallback link. Incoming root query and hash SHALL be discarded.

#### Scenario: Visitor opens repository root
- **WHEN** a visitor opens the base project-site URL with or without query/hash
- **THEN** `index.html` returns HTTP 200
- **AND** the browser reaches `diagnosis.html` without forwarding root query/hash

#### Scenario: JavaScript is unavailable
- **WHEN** entrypoint JavaScript cannot run
- **THEN** relative meta refresh or the visible relative fallback link still reaches diagnosis

### Requirement: First-party routes are project-subpath safe
Every first-party navigation and asset reference SHALL remain document-relative and valid under the repository subpath. Shared URLs SHALL derive their absolute origin from `document.baseURI`, not from a hardcoded local, tunnel or `github.io` host.

#### Scenario: Visitor navigates all pages
- **WHEN** the visitor starts from any product page on the Pages project URL
- **THEN** Diagnosis, Roadmap, Methodologies and Antipatterns remain in the same repository subpath
- **AND** local first-party assets return successfully

### Requirement: Real public delivery is verified against manifest and browser
Publication SHALL be accepted only after GitHub state, workflow conclusion, public HTTP bytes and real-browser behavior are independently verified. Workflow log text alone SHALL NOT count as delivery evidence.

#### Scenario: Public acceptance passes
- **WHEN** the first intended Pages deployment completes
- **THEN** repository visibility, remote SHA, Pages source and environment restrictions are read back
- **AND** root, four product pages and every artifact-manifest path return HTTP 200
- **AND** decoded response bytes match the approved SHA-256 manifest
- **AND** 390x844, 744x1133 and 1440x900 browser checks pass without critical errors or horizontal overflow

### Requirement: Public exposure incident response is documented
Documentation SHALL distinguish website rollback from confidentiality response. A post-publication secret/privacy incident SHALL require credential revocation first, push freeze, history remediation, full gate/review rerun and acknowledgement that prior copies cannot be retracted.

#### Scenario: Sensitive material is found after push
- **WHEN** a secret or private datum is discovered in public history
- **THEN** affected credentials are revoked before repository cleanup
- **AND** Pages is disabled and pushes are frozen
- **AND** remediation does not claim to retract existing third-party copies

### Requirement: Publication documentation records Pages boundaries
The README SHALL identify the canonical URL, approved artifact source, deployment/gate process, public/static boundary, unverified result semantics and current relevant Pages limits: 1 GB published site, 10-minute deployment timeout and 100 GB/month soft bandwidth. It SHALL state that custom Actions publishing is not subject to the Pages 10-builds/hour soft limit in the same way.

#### Scenario: Maintainer reviews documentation
- **WHEN** a maintainer prepares a publication or incident response
- **THEN** the required gate, artifact, Pages and static-hosting constraints are discoverable
- **AND** the documentation does not represent Python/Telegram backend or sensitive transactions as hosted by Pages

