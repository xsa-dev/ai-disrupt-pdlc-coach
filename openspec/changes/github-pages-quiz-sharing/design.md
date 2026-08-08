## Context

The product site consists of four static HTML documents plus vendored Tailwind runtime under `web/`. It has no Git remote, Pages workflow or `index.html`. Public preview currently uses an ephemeral `trycloudflare.com` origin, so shared links are not durable.

GitHub CLI is authenticated as `xsa-dev`; the publication target is `xsa-dev/ai-disrupt-pdlc-coach`, branch `master`, with expected project-site URL `https://xsa-dev.github.io/ai-disrupt-pdlc-coach/`. GitHub Free supports Pages for this public-repository scenario.

The Quiz is inline client-side JavaScript in `web/antipatterns.html`. It currently:

- has 31 registry entries and two questions per entry, for 62 questions total;
- constructs distractors and shuffles with `Math.random()`;
- labels a random ticket with a number that does not reproduce its contents;
- partitions fixed tickets as `10,10,10,10,10,10,2`;
- persists aggregate results in `aipdlc.quiz.progress.v1` under ambiguous keys such as `fixed:1` and `random`.

The repository also contains private runtime assessment fixtures and generated multi-agent integration files. Public publication is irreversible in practice: disabling Pages, deleting the repository or changing visibility cannot retract copies already fetched by third parties.

## Goals / Non-Goals

**Goals:**

- Publish only approved source history and `web/` artifact through a fail-closed process.
- Serve a stable HTTPS project-site URL that works under the repository subpath.
- Define an interoperable, versioned Quiz URL and deterministic challenge contract before implementation.
- Support fixed and seeded-random challenge links, native/clipboard sharing and read-only unverified result links.
- Preserve legacy result storage without falsely crediting remapped tickets.
- Verify the actual deployed bytes and browser behavior, not merely workflow logs.

**Non-Goals:**

- Server-side score verification, anti-cheat, identities, accounts or result storage.
- Per-result server-rendered Open Graph metadata.
- Custom domain, `0xhash.ru`, Caddy or Cloudflare named tunnel.
- Hosting Python/Telegram processes on Pages.
- Migrating temporary-origin localStorage between origins.
- Keeping private team assessment fixtures or generated agent integrations in public Git history.

## Decisions

### 1. Public repository identity and content disposition are fixed before apply

The target SHALL be `xsa-dev/ai-disrupt-pdlc-coach`, public, with `master` as the only deployment branch.

Public-history disposition:

| Content family | Disposition |
|---|---|
| `coach/data/teams/*.json` (all eight current files, including `AlxyTeam` and `ImprovedGuardrailsTeam`) | **PRIVATE** — remove from index and every reachable public-history ref; ignore future runtime JSON |
| 31 generated agent directories: `.agent`, `.amazonq`, `.augment`, `.bob`, `.claude`, `.cline`, `.clinerules`, `.codebuddy`, `.codex`, `.continue`, `.cospec`, `.crush`, `.cursor`, `.factory`, `.forge`, `.gemini`, `.iflow`, `.junie`, `.kilocode`, `.kimi`, `.kiro`, `.lingma`, `.omp`, `.opencode`, `.pi`, `.qoder`, `.qwen`, `.roo`, `.trae`, `.vibe`, `.windsurf` | **LOCAL/REGENERABLE** — remove from public history and ignore; they may be regenerated locally but are not product source |
| `.github/prompts/**`, `.github/skills/**` | **LOCAL/REGENERABLE** — remove from public history; `.github/workflows/**` remains approved |
| `web/**`, `tests/**` excluding dependencies/caches, `coach/**` excluding runtime team JSON, `openspec/**`, `scripts/**`, `.github/workflows/**`, `.gitignore`, `.gitleaks.toml`, `.env.example`, `README.md`, `PLAN.md`, `start-diagnosis-bot.sh` | **PUBLIC ALLOWLIST** |
| `.env`, private keys, credentials, PDFs, caches, `node_modules`, build output and gate reports | **FORBIDDEN** |

Before rewriting history, a local backup bundle may be written outside the repository. No backup ref may remain reachable in the repository scanned or pushed. After cleanup, the locally required Opsx integration SHALL be regenerated or restored as ignored, untracked files and smoke-tested with `openspec status`/`validate`; it must remain usable without re-entering the public path manifest. Other generated integrations are restored only if explicitly needed and remain ignored/untracked.

Rationale: runtime assessments are private data, and generated integrations are not required to understand, test or deploy the product. An explicit allowlist is safer than publishing everything not detected as a secret.

### 2. The publish gate is executable and fail-closed

Apply SHALL create a tracked policy and executable gate, for example `scripts/publish_gate.py` plus `publish-policy.json`. The gate has two modes:

1. `pre-create`: run immediately before public repository creation;
2. `pre-push`: rerun immediately before the first push and require the exact expected remote.

Both modes require an explicit `--approved-sha` and SHALL fail non-zero unless all checks pass:

- `HEAD` equals the approved full commit SHA;
- index and worktree are clean, with no untracked files outside explicitly ignored local-only families;
- all reachable refs and the final worktree pass Gitleaks;
- current tracked paths match the public allowlist and forbidden paths are absent;
- no backup/original/history-rewrite refs remain reachable;
- GitHub account is exactly `xsa-dev`;
- `pre-create` confirms the target repository does not exist and no `origin` is configured;
- `pre-push` confirms `origin` is exactly the credential-free target URL, the target repository exists, and `git ls-remote origin` returns **zero refs of every kind**;
- `web/` contains no symlink, hard link, device, FIFO or unexpected path;
- the generated sorted artifact manifest matches path, mode, size and SHA-256 policy.

The scanner is pinned to Linux amd64 image:

```text
zricethezav/gitleaks@sha256:b109bc5f8f76a38196a3e413704fc5b9e3c32360bce4e4b603bd6f45b3721dbb
```

The gate SHALL assert `gitleaks version == 8.30.1` and use a tracked reviewed configuration. Evidence is a redacted machine-readable JSON report written outside the repository with mode `0600`; it records approved SHA, policy hash, scanner digest/version, refs scanned, path-manifest hash and pass/fail checks, but never raw secret values.

A single fail-closed publication wrapper SHALL:

1. run `pre-create` against the approved SHA;
2. create an empty public repository without pushing;
3. assert unchanged `HEAD` and clean state;
4. add credential-free `origin`;
5. run `pre-push` against the same approved SHA;
6. push exactly `approved-sha:refs/heads/master`.

If any step fails, subsequent side effects do not run. An empty repository created before a failed `pre-push` exposes no source and is left for explicit inspection/removal.

### 3. Incident response covers repository exposure, not only Pages rollback

If a credential or private datum is found before publication, publication stops and remediation occurs before a complete gate rerun.

If discovered after publication:

1. revoke/rotate affected credentials first;
2. disable Pages and freeze further pushes;
3. remove or sanitize data and rewrite public history;
4. force-update or delete the repository only after review;
5. rerun the full gate and independent review before republishing;
6. record that prior clones, caches and forks cannot be retracted.

Disabling Pages is a website rollback, not a confidentiality rollback.

### 4. Pages deploys only a validated `web/` artifact

The workflow triggers on pushes to `master` and `workflow_dispatch`, but every job has an explicit `github.ref == 'refs/heads/master'` guard. The `github-pages` environment SHALL be configured to allow only `master`.

Official actions are pinned to reviewed immutable commit SHAs:

```text
actions/checkout@11d5960a326750d5838078e36cf38b85af677262
actions/configure-pages@983d7736d9b0ae728b81ab479565c72886d7745b
actions/upload-pages-artifact@56afc609e74202658d3ffba0e8f6dda462b719fa
actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e
```

Any dependency update requires explicit SHA review and policy update. Checkout uses the triggering `github.sha`, not a moving branch after job start.

The test job has `contents: read` only. The deploy job has exactly `contents: read`, `pages: write`, `id-token: write`, depends on the test/manifest job, and uses deployment concurrency. No repository secret is required.

Before upload, CI SHALL:

- run Python, jsdom and Chrome/CDP acceptance tests;
- reject root-absolute first-party paths and hardcoded preview/production origins;
- reject symlinks, hard links and unexpected files;
- generate a sorted artifact manifest containing relative path, mode, byte size and SHA-256;
- compare the manifest hash with the checked policy;
- upload only validated `web/` bytes.

After deployment, the same manifest is used to fetch every public path and compare decoded response bytes by SHA-256. A successful action log without manifest and public HTTP/browser verification is not delivery evidence.

### 5. The tracked root entrypoint has exact redirect semantics

`web/index.html` SHALL:

- return its own HTTP 200;
- use a zero-delay relative meta refresh to `diagnosis.html`;
- use `location.replace(new URL('diagnosis.html', location.href).href)` as the JavaScript path;
- contain an accessible visible relative fallback link;
- deliberately discard incoming root query and hash state;
- never hardcode an origin or root-relative path.

Quiz links always target `antipatterns.html` directly; root query/hash values are not forwarded.

### 6. First-party paths remain project-subpath safe

All first-party navigation/assets are document-relative. The internal canonical Quiz route is a relative route beginning with `antipatterns.html`. The absolute value passed to native share/clipboard is produced with `new URL(relativeRoute, document.baseURI).href`, preserving the active local, preview or Pages project origin without hardcoding it.

### 7. Quiz v1 stable identifiers and source order

Quiz version 1 uses these stable identities:

- registry entries: `ap-01` through `ap-31` in existing registry order;
- question identities: `<ap-id>:definition`, then `<ap-id>:fix` for each registry entry;
- canonical 62-question source order: `ap-01:definition`, `ap-01:fix`, `ap-02:definition`, `ap-02:fix`, …, `ap-31:definition`, `ap-31:fix`.

For a `definition` question, option source IDs resolve to registry `signs`; for a `fix` question, they resolve to registry `fixes`. Distractor candidates are same-type options from the other 30 registry entries in ascending `ap-id` order.

Changing registry membership, source order, question identity, text-to-option mapping or generation semantics requires a new `qv`.

### 8. Quiz v1 defines exact FNV-1a and Mulberry32 semantics

A seed is hashed over an ASCII domain-separated context string:

```text
AI-DISRUPT-QUIZ|qv=1|random|seed=<NORMALIZED_SEED>
AI-DISRUPT-QUIZ|qv=1|fixed|ticket=<DECIMAL_TICKET>
```

FNV-1a 32-bit:

```text
h = 0x811C9DC5
for each UTF-8 byte b of context:
    h = h XOR b
    h = Math.imul(h, 0x01000193) >>> 0
return h >>> 0
```

Mulberry32 exposes `nextUint32()` with JavaScript 32-bit semantics:

```text
state = (state + 0x6D2B79F5) >>> 0
t = state
t = Math.imul(t ^ (t >>> 15), t | 1)
t = t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))
return (t ^ (t >>> 14)) >>> 0
```

`nextFloat()` is exactly:

```text
nextUint32() / 4294967296
```

Fisher–Yates over array `a` is exactly:

```text
for i from a.length - 1 down to 1:
    j = Math.floor(nextFloat() * (i + 1))
    swap a[i], a[j]
```

No modulo reduction, rejection sampling, locale transformation or `Math.random()` participates in a versioned challenge.

### 9. Quiz v1 random generation and RNG consumption order are normative

A random challenge has exactly **10 questions**, selected without replacement.

Generation consumes one RNG stream in this exact order:

1. clone the canonical 62 question IDs;
2. Fisher–Yates shuffle all 62 IDs;
3. take the first 10 IDs as challenge order;
4. for each selected question in challenge order:
   - clone its 30 same-type distractor source IDs in ascending order;
   - Fisher–Yates shuffle all 30;
   - take the first three distractor IDs;
   - create `[correctSourceId, distractor1, distractor2, distractor3]`;
   - Fisher–Yates shuffle those four option IDs.

The result total for every valid qv1 random result is therefore exactly 10.

### 10. Quiz v1 fixed tickets are balanced and deterministic

The canonical source order is partitioned contiguously into seven tickets sized:

```text
9, 9, 9, 9, 9, 9, 8
```

Ticket question order is not shuffled. Each ticket uses its domain-separated fixed RNG only for distractor and option generation, applying step 4 from the random algorithm in question order. The UI SHALL show actual totals and SHALL NOT claim all tickets contain ten questions.

### 11. Normative golden vectors lock Quiz v1

For random seed `8K3M`:

```text
context: AI-DISRUPT-QUIZ|qv=1|random|seed=8K3M
FNV-1a: 0xD121509A (3508621466)
first nextUint32 values:
3616126141, 3492414029, 2295842057, 4125266647, 3602705234
```

Question order and option source IDs:

```text
ap-31:fix        distractors ap-16,ap-17,ap-09  options ap-16,ap-17,ap-31,ap-09
ap-11:fix        distractors ap-30,ap-06,ap-23  options ap-23,ap-30,ap-06,ap-11
ap-06:definition distractors ap-13,ap-24,ap-17  options ap-17,ap-06,ap-13,ap-24
ap-09:fix        distractors ap-25,ap-05,ap-03  options ap-05,ap-09,ap-25,ap-03
ap-10:definition distractors ap-21,ap-13,ap-27  options ap-27,ap-13,ap-21,ap-10
ap-18:fix        distractors ap-12,ap-17,ap-02  options ap-17,ap-12,ap-02,ap-18
ap-30:definition distractors ap-13,ap-23,ap-04  options ap-13,ap-23,ap-30,ap-04
ap-24:fix        distractors ap-07,ap-05,ap-13  options ap-24,ap-07,ap-05,ap-13
ap-01:fix        distractors ap-15,ap-07,ap-10  options ap-15,ap-07,ap-10,ap-01
ap-03:fix        distractors ap-28,ap-26,ap-04  options ap-03,ap-28,ap-26,ap-04
```

For fixed ticket 3:

```text
context: AI-DISRUPT-QUIZ|qv=1|fixed|ticket=3
FNV-1a: 0xEF0FF456 (4010800214)
questions:
ap-10:definition, ap-10:fix, ap-11:definition, ap-11:fix,
ap-12:definition, ap-12:fix, ap-13:definition, ap-13:fix,
ap-14:definition
first question options: ap-31,ap-10,ap-23,ap-12
second question options: ap-10,ap-01,ap-17,ap-23
```

Tests SHALL derive these values from implementation and compare them to these predetermined vectors.

### 12. Canonical URL grammar is complete

Allowed query keys and canonical serialization order:

```text
quiz, qv, ticket, seed, strict, score, total, autostart
```

Generated routes end with `#quiz-section`. Rules:

| Mode | Required | Optional | Forbidden |
|---|---|---|---|
| `setup` | `quiz=setup`, `qv=1` | none | `ticket`, `seed`, `strict`, `score`, `total`, `autostart` |
| `fixed` | `quiz=fixed`, `qv=1`, `ticket=1..7` | `strict=1`; result pair `score,total`; `autostart=1` only without result | `seed`; lone score/total; result with autostart |
| `random` | `quiz=random`, `qv=1`, valid `seed` | `strict=1`; result pair `score,total`; `autostart=1` only without result | `ticket`; lone score/total; result with autostart |

Seed input grammar is ASCII `[A-Za-z0-9]{4,12}`. Accepted lowercase is normalized with ASCII uppercase and serialized as `[A-Z0-9]{4,12}`. Whitespace, percent-decoded non-ASCII and empty values are invalid.

Numeric values use canonical decimal grammar `0|[1-9][0-9]*` with no sign or leading zero. `qv` must be exactly `1`. `strict=0` is accepted as false but omitted from canonical output; omitted strict also means false. Only `strict=1` is emitted. Only `autostart=1` is valid and generated share actions always omit it.

`score` and `total` must appear together. Score must satisfy `0 <= score <= total`; fixed total must equal the referenced ticket size; random total must equal 10. Percent is never accepted from URL and is computed locally.

If any allowlisted key occurs more than once, the whole deeplink is invalid. Unknown keys may be ignored on input but are never emitted. `quiz` without `qv`, allowlisted mode fields without `quiz`, illegal combinations and unsupported versions are invalid.

Fragment rules apply whenever `quiz` is present:

| Incoming fragment | Result |
|---|---|
| exactly `#quiz-section` | canonical |
| missing fragment or a trailing empty `#` | valid but noncanonical; replace with exact `#quiz-section` |
| any other raw fragment, including case variants, extra `#`, percent-encoded or double-encoded spellings such as `#quiz%2Dsection` | invalid whole deeplink; retain address and show safe setup error |

Fragment comparison uses the raw serialized URL fragment and does not percent-decode an alternative spelling into equivalence. If `quiz` is absent, ordinary page/localStorage behavior remains and hash-only exact `#quiz-section` works; unrelated fragments follow ordinary browser behavior and are outside the Quiz query grammar.

A valid but noncanonical link (lowercase seed, `strict=0`, unordered parameters, missing fragment or empty fragment) is normalized with `history.replaceState` without reload or storage mutation. An invalid link is not silently rewritten: setup plus an error notice is rendered, autostart is disabled and storage remains unchanged.

Canonical examples:

```text
antipatterns.html?quiz=setup&qv=1#quiz-section
antipatterns.html?quiz=fixed&qv=1&ticket=3&strict=1#quiz-section
antipatterns.html?quiz=random&qv=1&seed=8K3M#quiz-section
antipatterns.html?quiz=fixed&qv=1&ticket=3&score=8&total=9#quiz-section
```

### 13. Explicit deeplinks and legacy persistence have deterministic precedence

The new key is:

```text
aipdlc.quiz.progress.v2
```

Schema:

```json
{
  "schema": 2,
  "done": {
    "qv1:fixed:3:strict:0": {"score": 8, "total": 9, "pct": 89, "bestAt": 1000, "lastAttemptAt": 1000},
    "qv1:random:8K3M:strict:1": {"score": 9, "total": 10, "pct": 90, "bestAt": 2000, "lastAttemptAt": 3000}
  }
}
```

Validation is strict and atomic:

- top level must be a plain non-array JSON object with exactly `schema` and `done` own keys;
- `schema` must be the JSON number/integer `2`;
- `done` must be a plain non-array object;
- every key must match either `^qv1:fixed:([1-7]):strict:([01])$` or `^qv1:random:([A-Z0-9]{4,12}):strict:([01])$`;
- every value must be a plain object with exactly `score,total,pct,bestAt,lastAttemptAt`;
- all five values must be JSON numbers that are safe non-negative integers;
- `0 <= score <= total`; total must equal referenced fixed ticket size or 10 for random;
- `pct` must equal `Math.round(score / total * 100)`;
- `bestAt <= lastAttemptAt`.

Unknown top-level fields, unknown/malformed identities, unknown record fields, non-finite/fractional/string values or one invalid entry invalidate the **entire** v2 store for the session. Raw storage remains byte-for-byte untouched, automatic persistence is disabled, and UI offers an explicit reset action. Only that user-confirmed reset may replace malformed raw v2.

Update and retention rules:

- completion time is `attemptAt = max(0, floor(Date.now()))`; for an existing identity, effective time is `max(previous.lastAttemptAt, attemptAt)`;
- every completion updates `lastAttemptAt` to effective time;
- a strictly higher percentage replaces score/total/pct and sets `bestAt` to effective time;
- an equal or lower percentage retains previous score/total/pct/bestAt while still updating `lastAttemptAt`;
- fixed progress counts unique fixed ticket numbers with any strict variant at or above 80%, denominator seven;
- random results do not increment fixed-ticket progress;
- after every valid completion, random identities are ordered by ascending `lastAttemptAt`, then ascending identity string; while more than 100 remain, the first item is evicted;
- fixed identities are never evicted;
- a valid loaded store containing more than 100 random identities is normalized with the same ordering in memory but not written until a subsequent valid local completion.

Legacy `aipdlc.quiz.progress.v1` records are not migrated because fixed mappings and random identity changed. The old key remains byte-for-byte untouched and may trigger a one-time explanatory notice; it gives no qv1 completion credit. Starting a challenge does not write progress. Only local completion writes a valid v2 store, except while malformed raw v2 is quarantined pending explicit reset.

A valid explicit challenge/result URL controls presented state before legacy/v2 restoration. Parsing, canonicalization and read-only result rendering modify neither v1 nor v2 storage. Tests snapshot both keys and all localStorage entries before and after those operations.

### 14. Shared results are validated, isolated and explicitly unverified

Read-only result state is valid only when its challenge identity and aggregate satisfy the URL grammar. The card SHALL include this programmatically associated Russian disclosure:

```text
Неподтверждённый результат: данные взяты из ссылки, могут быть изменены отправителем и не проверялись сервером.
```

The disclosure is referenced by the card with `aria-describedby`. Result viewing never records completion. The CTA strips `score` and `total`, preserves challenge identity, and returns to explicit setup; only user Start or valid explicit `autostart=1` begins the challenge.

No participant name, answer history, diagnosis or team data enters the URL or share payload.

### 15. Web Share failures follow an exact matrix

| Condition | Required behavior |
|---|---|
| `navigator.share` resolves | show success if needed; never copy |
| accessing or invoking `navigator.share` throws synchronously with `AbortError`, or returned Promise rejects with `AbortError` | treat as user cancellation; no error and no copy |
| accessing/invoking native share throws synchronously with any other error, or Promise rejects with any other error | attempt clipboard fallback |
| Web Share unavailable | attempt clipboard fallback |
| `navigator.clipboard.writeText` resolves | show accessible copied feedback |
| accessing/invoking clipboard throws synchronously, Clipboard is unavailable, or its Promise rejects | reveal a focused, selectable manual-copy control and instruction |

Capability access and function invocation SHALL be inside the same guarded error boundary as Promise awaiting, so no synchronous platform error escapes the click handler. Feedback uses an `aria-live` region and does not rely on color. Shared text contains score/total/percentage when sharing results and an absolute URL derived from the canonical relative route.

### 16. External dependencies have explicit acceptance classification

Tailwind and header icons are local. Existing HTTPS Google Fonts and Font Awesome are visual enhancements; system-font and inline/header fallbacks keep core navigation and Quiz usable if they fail. jsPDF/html2pdf are functional export dependencies: their failure is a release blocker for the corresponding diagnosis/roadmap export acceptance path unless they are vendored during apply.

The deployment network audit SHALL record every external origin, verify no HTTP mixed content, and document integrity/failure behavior. Introducing a new external executable script requires explicit allowlist and integrity review.

### 17. Responsive and integration baseline is pinned

Browser acceptance viewports are:

```text
390x844
744x1133
1440x900
```

All require no horizontal overflow; 390/744 retain existing header geometry/navigation assertions. At apply start, record the exact integration baseline SHA and active OpenSpec changes. Immediately before public gate, rebase/reconcile against any diagnosis or roadmap changes merged since that baseline, then rerun the complete local and public acceptance suite.

### 18. Documentation records current Pages boundaries

README SHALL record the canonical URL, deployment process, unverified-result semantics and GitHub Pages limits verified for this change: 1 GB published-site limit, 10-minute deployment timeout and 100 GB/month soft bandwidth limit. It SHALL note that the Pages 10-builds/hour soft limit does not apply to custom Actions publishing, while GitHub Actions has its own applicable limits.

## Risks / Trade-offs

- **Public copies cannot be recalled** → private fixtures and generated integrations are purged before push; incident response states residual-copy risk.
- **Versioned links become incompatible after content changes** → qv1 algorithms, IDs and golden vectors are normative; future changes increment `qv`.
- **Client score is forgeable** → strict validation plus explicit, accessible unverified disclosure; verified results remain backend work.
- **Legacy progress cannot map safely** → preserve v1 byte-for-byte, start a separate v2 namespace and explain why old credit is not imported.
- **Native share support varies** → exact error matrix, clipboard and manual-copy fallbacks.
- **Workflow dependencies can move or be compromised** → immutable full-SHA action pins and reviewed scanner digest.
- **A gate/publication race exposes a different commit** → approved SHA is reasserted immediately before creation and push in one fail-closed wrapper.
- **CDN degradation affects exports/visuals** → classify critical versus optional resources and block release on failed critical export acceptance.

## Migration Plan

1. Record baseline SHA and active changes.
2. Implement URL/RNG/storage contracts test-first and pass local regressions.
3. Implement index, hardened workflow, artifact manifest and publish-gate scripts without a remote.
4. Remove private team JSON and generated integration families from tracked reachable history; restore only approved local ignored copies if needed.
5. Narrow `.gitignore` so sanitized `.env.example` can be tracked while real env files remain forbidden.
6. Commit the complete candidate and record its full SHA.
7. Run the fail-closed gate and independent review on that exact SHA.
8. Run the publication wrapper to create the empty public repository and push exactly that SHA to `master`.
9. Restrict the `github-pages` environment to `master`, enable Actions publishing and observe deployment.
10. Verify manifest hashes, HTTP 200 responses and 390/744/1440 browser behavior on the real Pages origin.
11. Keep quick tunnel only as temporary preview until public acceptance passes.

## Open Questions

None blocking. Changing repository name, Quiz v1 algorithms, public allowlist or result trust model requires an explicit OpenSpec update before apply or a new change after publication.
