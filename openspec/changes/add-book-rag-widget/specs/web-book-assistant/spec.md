## ADDED Requirements

### Requirement: Open a source-grounded book chat
Every public HTML page SHALL provide an explicit action to open the separately hosted AI-Disrupt PDLC book assistant without uploading team assessments automatically.

#### Scenario: Explicit opening
- **WHEN** the user presses the book assistant button
- **THEN** an HTTPS iframe opens with the book chat
- **AND** no team profile or maturity answer is included in the iframe URL

#### Scenario: Lazy loading
- **WHEN** any public page loads before the user opens the assistant
- **THEN** the iframe has no source and does not load the backend

### Requirement: Preserve the page workflow
The widget SHALL isolate its styles and keep the diagnosis and contact actions usable.

#### Scenario: Closing the chat
- **WHEN** the user presses the close button or Escape from the widget controls
- **THEN** the iframe panel closes and focus returns to its launcher

#### Scenario: Source inspection
- **WHEN** a question about L0–L5, R0–R5 or Evidence Bundle receives a supported answer
- **THEN** the chat displays links to the book and an expandable block with vector, BM25 and final-context results

### Requirement: Publish only reviewed static assets
The publication allowlist SHALL include the exact widget JS path and SHALL exclude server credentials, backend runtime and the PDF corpus.

#### Scenario: Pages artifact validation
- **WHEN** the artifact manifest is generated
- **THEN** the widget JS is present with a content hash and no provider key is included
