## ADDED Requirements

### Requirement: Quiz v1 uses stable question identities
Quiz version 1 SHALL identify registry entries as `ap-01` through `ap-31` and questions as `<ap-id>:definition` then `<ap-id>:fix` in ascending registry order. Definition options SHALL resolve from registry signs, fix options from registry fixes, and same-type distractor candidates SHALL use the other 30 entry IDs in ascending order.

#### Scenario: Canonical source is enumerated
- **WHEN** qv1 question metadata is built
- **THEN** exactly 62 unique question identities exist
- **AND** their order begins `ap-01:definition`, `ap-01:fix` and ends `ap-31:definition`, `ap-31:fix`

### Requirement: Quiz v1 deterministic algorithm is normative
Quiz v1 SHALL use the exact domain-separated FNV-1a 32-bit hash, Mulberry32 state transition, `nextUint32()/4294967296` float conversion and descending Fisher–Yates index operation defined in design. JavaScript `Math.imul`, unsigned `>>> 0` semantics and the specified RNG consumption order SHALL be preserved. `Math.random()` SHALL NOT influence a versioned challenge.

#### Scenario: Algorithm primitive vector is checked
- **WHEN** context `AI-DISRUPT-QUIZ|qv=1|random|seed=8K3M` is evaluated
- **THEN** FNV-1a equals `0xD121509A`
- **AND** the first five unsigned PRNG values equal `3616126141,3492414029,2295842057,4125266647,3602705234`

#### Scenario: Implementation changes generation semantics
- **WHEN** identifiers, source order, hash, PRNG, shuffle or RNG consumption semantics change
- **THEN** the Quiz version is incremented
- **AND** the new implementation does not claim qv1 compatibility

### Requirement: Seeded random challenge is exactly reproducible
A qv1 random challenge SHALL contain exactly ten questions selected without replacement by shuffling all 62 canonical question IDs and taking the first ten. For each selected question, the same RNG stream SHALL shuffle all 30 stable distractor IDs, take three, and shuffle the correct plus three distractor option IDs.

#### Scenario: Golden random challenge is generated
- **WHEN** seed `8K3M` and qv1 are generated in a fresh context
- **THEN** question order, distractor membership and option order exactly match the complete normative golden vector in design
- **AND** result total is exactly 10

#### Scenario: Same seed is opened in separate contexts
- **WHEN** separate fresh browser contexts open the same normalized seed and qv
- **THEN** they receive identical question, distractor and option identity sequences

### Requirement: Fixed tickets are balanced and deterministic
Quiz v1 SHALL partition the canonical 62-question order contiguously into fixed tickets sized `9,9,9,9,9,9,8`. Question order SHALL remain canonical. Each ticket SHALL derive its distractor/option RNG from the fixed domain-separated context specified in design.

#### Scenario: Fixed partition is enumerated
- **WHEN** all qv1 fixed tickets are generated
- **THEN** every question appears exactly once
- **AND** no ticket contains fewer than eight questions
- **AND** ticket 3 and its first option orders match the normative design vector

### Requirement: Canonical Quiz URL grammar is complete
The parser and serializer SHALL implement only keys `quiz,qv,ticket,seed,strict,score,total,autostart` in that serialization order and the legal mode/fragment matrix in design. Generated routes SHALL be relative `antipatterns.html` routes ending in exact raw `#quiz-section`; absolute share values SHALL be resolved from `document.baseURI`.

#### Scenario: Canonical fixed link is generated
- **WHEN** qv1 fixed ticket 3 in strict mode is serialized
- **THEN** the relative route is `antipatterns.html?quiz=fixed&qv=1&ticket=3&strict=1#quiz-section`

#### Scenario: Canonical random link normalizes seed and defaults
- **WHEN** valid lowercase seed `8k3m` with `strict=0` is parsed
- **THEN** seed is normalized to `8K3M`
- **AND** canonical output omits default strict and orders parameters as `quiz=random&qv=1&seed=8K3M`

#### Scenario: Duplicate or illegal parameter is supplied
- **WHEN** an allowlisted key is duplicated, required qv is absent, or a mode-forbidden combination is present
- **THEN** the whole deeplink is invalid
- **AND** setup plus an understandable error is rendered without autostart or storage mutation

#### Scenario: Unknown parameters are supplied with a valid link
- **WHEN** a valid deeplink also contains unknown query keys
- **THEN** known state is accepted
- **AND** unknown keys are omitted from canonical output

#### Scenario: Missing or empty fragment is supplied
- **WHEN** an otherwise valid explicit Quiz URL has no fragment or ends in an empty `#`
- **THEN** it is accepted as noncanonical
- **AND** canonicalization writes exact `#quiz-section` without storage mutation

#### Scenario: Wrong fragment spelling is supplied
- **WHEN** an explicit Quiz URL has any non-empty raw fragment other than exact `#quiz-section`, including case, extra-hash, percent-encoded or double-encoded variants
- **THEN** the whole deeplink is invalid and its address is retained
- **AND** safe setup error renders without autostart or storage mutation

### Requirement: URL values use exact validation and canonicalization rules
Seed input SHALL match ASCII `[A-Za-z0-9]{4,12}` before uppercase normalization. Numeric input SHALL match `0|[1-9][0-9]*`. `qv` SHALL equal 1; ticket SHALL be 1 through 7; only strict 0/1 and autostart 1 are valid. Score and total SHALL occur together, result SHALL forbid autostart, fixed total SHALL equal ticket size, and random total SHALL equal 10.

#### Scenario: Valid noncanonical link is opened
- **WHEN** a supported link differs only in case, parameter order, explicit `strict=0`, missing fragment or empty fragment
- **THEN** `history.replaceState` writes canonical URL form without reload
- **AND** localStorage remains byte-for-byte unchanged

#### Scenario: Unsupported or inconsistent result is opened
- **WHEN** score exceeds total, total does not equal challenge size, or qv is unsupported
- **THEN** no result success state is rendered
- **AND** the invalid address is retained for diagnosis while safe setup is shown

### Requirement: Explicit deeplinks have non-destructive precedence
A valid explicit challenge/result URL SHALL control presented state before v1/v2 progress restoration. Parsing, canonicalization, setup and read-only result rendering SHALL not write, delete or replace any localStorage entry. Starting a challenge SHALL not persist progress; only local completion may write v2.

#### Scenario: Returning recipient opens shared state
- **WHEN** a recipient with existing v1/v2 data opens a challenge or result link
- **THEN** linked state is presented
- **AND** every pre-existing localStorage key/value remains byte-for-byte unchanged before local completion

#### Scenario: No quiz parameter is present
- **WHEN** the page opens without `quiz`
- **THEN** ordinary page/progress behavior remains
- **AND** hash-only `#quiz-section` still opens the Quiz section

### Requirement: Quiz result persistence is versioned
New completion results SHALL use `aipdlc.quiz.progress.v2` with exact top-level keys `schema: 2` and plain-object `done`. Identities SHALL be `qv1:fixed:<ticket>:strict:<0|1>` or `qv1:random:<seed>:strict:<0|1>`. Every record SHALL have exactly safe non-negative integer `score,total,pct,bestAt,lastAttemptAt` fields satisfying challenge total, computed rounded percentage and `bestAt <= lastAttemptAt`. Any malformed field, identity, unknown key or entry SHALL invalidate the entire store in memory, preserve raw bytes and disable automatic writes until explicit user reset.

#### Scenario: Distinct seeded challenges complete
- **WHEN** two different random seeds are completed
- **THEN** they are stored under distinct identities
- **AND** neither overwrites the other solely because both are random mode

#### Scenario: Fixed strict variants complete
- **WHEN** strict and non-strict variants of one fixed ticket are completed
- **THEN** both exact identities may retain their best result
- **AND** progress counts the ticket at most once toward seven

#### Scenario: Lower or equal score is completed later
- **WHEN** an existing identity completes with percentage not greater than its retained best
- **THEN** score/total/pct/bestAt remain unchanged
- **AND** lastAttemptAt advances monotonically to `max(previous.lastAttemptAt, floor(Date.now()))`

#### Scenario: Higher score is completed later
- **WHEN** an existing identity completes with a strictly greater percentage
- **THEN** best aggregate fields are replaced
- **AND** bestAt and lastAttemptAt equal the monotonic effective completion time

#### Scenario: Random history exceeds retention bound
- **WHEN** more than 100 random identities are stored
- **THEN** eviction orders ascending by lastAttemptAt and then ascending identity string
- **AND** the first identities are removed until exactly 100 random identities remain
- **AND** fixed identities are retained

#### Scenario: One v2 entry is malformed
- **WHEN** any top-level field, identity or result record violates the strict schema
- **THEN** the entire v2 store is treated as empty for the session
- **AND** its raw value is not modified and completion cannot overwrite it until explicit reset

### Requirement: Legacy progress remains isolated
`aipdlc.quiz.progress.v1` SHALL remain byte-for-byte untouched and SHALL not be migrated into qv1 credit because ticket membership and random identity changed. A legacy-data notice MAY be shown without deleting or rewriting the legacy key. Malformed v2 data SHALL fail closed to empty in-memory state without destroying raw storage.

#### Scenario: Legacy fixed result exists
- **WHEN** v1 contains `fixed:1` before qv1 loads
- **THEN** it does not credit qv1 fixed ticket 1
- **AND** the v1 storage bytes remain unchanged

#### Scenario: Legacy random result exists
- **WHEN** v1 contains the unseeded `random` identity
- **THEN** it does not credit any seeded random challenge

### Requirement: Share Quiz follows deterministic fallback semantics
The interface SHALL provide Share Quiz for setup and configured challenges. The payload SHALL use the canonical challenge route and identify mode, ticket or seed, strict mode and qv. Accessing/invoking native share and awaiting its result SHALL be one guarded boundary: synchronous or asynchronous `AbortError` is silent cancellation and every other failure attempts clipboard. Accessing/invoking/awaiting clipboard SHALL also be guarded; any synchronous throw, rejection or absence reveals a focused selectable manual-copy control.

#### Scenario: Native share succeeds
- **WHEN** `navigator.share` resolves
- **THEN** human-readable text and absolute canonical URL were supplied
- **AND** clipboard is not invoked

#### Scenario: User cancels native share
- **WHEN** accessing/invoking native share throws synchronously with `AbortError` or its Promise rejects with `AbortError`
- **THEN** no error is announced
- **AND** clipboard is not invoked

#### Scenario: Native and clipboard paths fail
- **WHEN** native share fails synchronously/asynchronously with a non-cancellation error and clipboard access/invocation/Promise cannot write
- **THEN** a focused selectable manual-copy value is shown
- **AND** the Quiz remains usable

#### Scenario: Native share throws synchronously with non-cancellation error
- **WHEN** its property access or function invocation throws before returning a Promise
- **THEN** clipboard fallback is attempted
- **AND** no exception escapes the share click handler

### Requirement: Share Result includes the same challenge
After local completion, Share Result SHALL include score, total, locally calculated percentage, qv, strict mode and fixed ticket or normalized random seed. Its canonical URL SHALL reproduce the same challenge and carry only validated aggregate result data.

#### Scenario: Fixed result is shared
- **WHEN** a participant shares a completed fixed ticket
- **THEN** payload result total equals that ticket's qv1 size
- **AND** its URL references the same ticket and strict mode

#### Scenario: Random result is shared
- **WHEN** a participant shares a completed seeded challenge
- **THEN** total equals 10
- **AND** its URL references the same normalized seed and strict mode

### Requirement: Shared results are read-only, private and explicitly unverified
A valid URL result SHALL render only aggregate result and challenge metadata, SHALL not write completion, and SHALL include a disclosure programmatically associated through `aria-describedby`: `Неподтверждённый результат: данные взяты из ссылки, могут быть изменены отправителем и не проверялись сервером.` Participant name, answer history, diagnosis and team assessment data SHALL NOT appear in URLs or payloads.

#### Scenario: Valid result link is inspected
- **WHEN** a recipient opens a valid score/total pair for a known challenge
- **THEN** percentage is computed locally
- **AND** the exact unverified disclosure is associated with the result card
- **AND** all localStorage entries remain unchanged

#### Scenario: Recipient chooses to attempt the challenge
- **WHEN** the result-card CTA is activated
- **THEN** score and total are removed
- **AND** challenge identity is preserved in explicit setup
- **AND** no progress is recorded until completion

### Requirement: Existing Quiz and responsive behavior remains compatible
The change SHALL preserve keyboard navigation, strict scoring, answer feedback, completion threshold, restart, no-query progress behavior and existing page contracts. Browser acceptance SHALL run at 390x844, 744x1133 and 1440x900 without horizontal overflow.

#### Scenario: Existing regression paths run after implementation
- **WHEN** the Quiz is used without a deeplink and all product pages are exercised
- **THEN** existing interactions remain available
- **AND** shared header/navigation geometry remains valid at 390 and 744 widths
- **AND** all three viewports have zero horizontal overflow
