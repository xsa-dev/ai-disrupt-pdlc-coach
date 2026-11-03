# books-fork Specification

## ADDED Requirements

### Requirement: Floating unobtrusive fork trigger with mobile collision avoidance
The application SHALL render a persistent, unobtrusive floating trigger element on all published pages.
1. The trigger SHALL be a semantic button element (`<button type="button">`) with `aria-haspopup="dialog"`, `aria-controls="books-fork-dialog"`, and `aria-expanded="false"`.
2. The trigger SHALL be positioned at the bottom-left of the viewport with safe-area spacing: `bottom: calc(1rem + var(--sab, env(safe-area-inset-bottom, 0px)))` and `left: calc(1rem + var(--sal, env(safe-area-inset-left, 0px)))`.
3. The trigger SHALL feature a touch target of at least 44x44 CSS pixels.
4. The trigger SHALL include an accessible label indicating that it opens the methodology fork dialog (`aria-label="Развилка методологии: книги PSLC и Vibe PPM"`).
5. On desktop viewports (>= 640px), the trigger SHALL display the full text `🧭 Развилка: PSLC ← | → Vibe PPM`.
6. On mobile viewports (< 640px), the trigger text SHALL adaptively collapse to `🧭 Развилка` with `max-width: calc(100vw - 200px)` to guarantee zero visual collision with the right-side author FAB button (`.contact-fab`) at 390px and 360px viewports.
7. The floating trigger SHALL have `z-index: 1000` aligned with page action buttons.

#### Scenario: User discovers methodology fork on mobile or desktop
- **WHEN** the user opens any published page (`diagnosis.html`, `roadmap.html`, `methodologies.html`, `antipatterns.html`, `openspec.html`, `course-openspec.html`, `glossary.html`, or `index.html`)
- **THEN** an unobtrusive floating chip with text containing "Развилка" is visible in the bottom-left area
- **AND** at 390px viewport width, the chip collapses to a compact label without overlapping the right-side contact FAB button
- **AND** the trigger carries `aria-haspopup="dialog"`, `aria-controls="books-fork-dialog"`, and `aria-expanded="false"`

### Requirement: Interactive split dialog presentation
When activated by any fork trigger, the application SHALL display a modal dialog with an interactive two-wing split presenting AI-Disrupt PSLC on the left and Vibe PPM on the right.
1. The dialog SHALL be assigned semantic accessibility attributes: `role="dialog"`, `aria-modal="true"`, `id="books-fork-dialog"`, `aria-labelledby="books-fork-title"`, and `aria-describedby="books-fork-desc"`.
2. The dialog SHALL contain a close button with `aria-label="Закрыть"` and an accessible touch target of at least 44x44 CSS pixels.
3. The dialog backdrop overlay SHALL have `z-index: 2147483001` to ensure clean overlaying above all page layers, including the book assistant widget host (`z-index: 2147483000`).
4. The left wing SHALL feature **AI-Disrupt PSLC**:
   - An explicit indicator or badge denoting the engineering track (`← Инженерный трек` / `← Код`).
   - The book title "AI-Disrupt PSLC".
   - Concise summary covering the problem-solving lifecycle, intention engineering, and generative architectures.
   - A direct external link to `https://aipdlc.ru/ru/pslc` with `target="_blank"` and `rel="noopener"`.
5. The right wing SHALL feature **Vibe PPM**:
   - An explicit indicator or badge denoting the product & portfolio track (`Продуктовый трек →` / `Продукт →`).
   - The book title "Vibe PPM".
   - Concise summary covering product vibe coding, hypothesis velocity, and distributed portfolio management.
   - A direct external link to `https://aipdlc.ru/ru/vibeppm` with `target="_blank"` and `rel="noopener"`.
6. The dialog SHALL include a bridge to the foundational AI-Disrupt PDLC Whitepaper with a direct link to `https://aipdlc.ru/documents/ru/whitepaper_full_ru.pdf` with `target="_blank"` and `rel="noopener"`.
7. The dialog SHALL display a legal disclaimer naming Кирилл Меньшов as author of the concept, linking to `https://aipdlc.ru/ru/` with `target="_blank"` and `rel="noopener"` for ПАО Сбербанк as copyright holder, and providing an active link to `https://aipdlc.ru/ru/legal-info` (`target="_blank"`, `rel="noopener"`) citing materials for non-commercial educational purposes under Art. 1274 Civil Code RF.

#### Scenario: User opens fork modal and examines tracks and legal attribution
- **WHEN** the user clicks or taps the fork trigger
- **THEN** the modal dialog opens smoothly with backdrop dimming above all page layers (`z-index: 2147483001`)
- **AND** the left card links directly to `https://aipdlc.ru/ru/pslc` with `target="_blank"` and `rel="noopener"`
- **AND** the right card links directly to `https://aipdlc.ru/ru/vibeppm` with `target="_blank"` and `rel="noopener"`
- **AND** the Whitepaper bridge links to `https://aipdlc.ru/documents/ru/whitepaper_full_ru.pdf` with `target="_blank"` and `rel="noopener"`
- **AND** the legal disclaimer identifies "Кирилл Меньшов", links to "https://aipdlc.ru/ru/" for "ПАО Сбербанк", and links to "https://aipdlc.ru/ru/legal-info" for rules of use

### Requirement: Keyboard accessibility, focus trap, and background scroll lock
The modal dialog SHALL conform strictly to WAI-ARIA Modal Dialog accessibility requirements:
1. When opened, focus SHALL move inside the modal to the close button or first interactive link.
2. While the modal dialog is open, keyboard focus SHALL be trapped within the dialog's interactive elements (Tab wraps from last to first, Shift+Tab wraps from first to last).
3. While the modal dialog is open, the underlying page content SHALL be marked `inert` to prevent screen reader drift, and document root scrolling SHALL be disabled (`overflow: hidden`).
4. Pressing the `Escape` key SHALL immediately dismiss the modal dialog.
5. Clicking on the backdrop overlay outside the dialog panel SHALL dismiss the modal dialog.
6. When dismissed, keyboard focus SHALL be restored to the specific element (floating chip or footer button) that initiated opening.

#### Scenario: Keyboard user navigates and dismisses the fork modal with focus restoration
- **WHEN** the modal dialog is open
- **AND** the user tabs through the modal elements
- **THEN** focus wraps cyclically within the modal and cannot escape to the background document
- **WHEN** the user presses the `Escape` key
- **THEN** the modal closes, inertness and scroll lock are removed, and focus returns to the triggering element

### Requirement: Mobile-first responsive layout without horizontal overflow
The fork trigger and modal dialog SHALL be fully responsive across mobile (390px), tablet (744px), and desktop (1200px) viewports without horizontal document overflow:
1. On viewports below 640px, the two book cards SHALL stack vertically while preserving directional badges (`←` and `→`).
2. All interactive tap targets SHALL maintain at least 44px height and width.
3. The modal dialog container SHALL respect viewport boundaries with `max-height: calc(100vh - 2rem); max-height: calc(100dvh - 2rem); overflow-y: auto;` and `box-sizing: border-box`.
4. Safe-area insets (`env(safe-area-inset-bottom)`, `env(safe-area-inset-left)`) SHALL be respected for positioning and padding.
5. The document SHALL produce zero horizontal scroll (`scrollWidth === clientWidth`) at all target breakpoints.

#### Scenario: Mobile user views the modal dialog on small screen
- **WHEN** the user opens the modal dialog on a viewport width of 390 CSS pixels or 375 CSS pixels
- **THEN** both book cards remain fully readable and operable in vertical stack
- **AND** the dialog scrolls smoothly within the viewport without horizontal document overflow

### Requirement: Encapsulated implementation and idempotent initialization
The books fork component SHALL be implemented as an isolated, idempotent Vanilla JS module with scoped CSS.
1. `web/books-fork-modal.js` SHALL be wrapped in an IIFE with `'use strict'` preventing global namespace leakage.
2. The component SHALL check for `document.body.hasAttribute('data-books-fork-initialized')` before initializing and set `data-books-fork-initialized="true"` to prevent duplicate DOM nodes or event listeners upon re-execution.
3. `web/books-fork-modal.css` SHALL use a strict class prefix `.books-fork__*` without un-scoped tag selectors.
4. Event handling SHALL use event delegation for any element matching `[data-books-fork-trigger]`.

#### Scenario: Script is executed multiple times in test or runtime environment
- **WHEN** `web/books-fork-modal.js` runs more than once in the same document
- **THEN** exactly one floating chip and exactly one modal dialog are present in the DOM

### Requirement: Publish only reviewed static assets
The repository build and deployment gate SHALL only permit reviewed and allowlisted static assets.
1. The new assets `web/books-fork-modal.js` and `web/books-fork-modal.css` SHALL be registered in `publish-policy.json` under `allowed_web_files`.
2. The exact file list in `tests/test_publish_artifact.py` SHALL match `publish-policy.json`.
3. The asset files SHALL NOT contain root-absolute links (`href="/..."`) or prohibited external preview domains.

#### Scenario: Publication gate validates artifact manifest
- **WHEN** `scripts/publish_gate.py` and `scripts/artifact_manifest.py` execute
- **THEN** the web artifact manifest validates successfully with zero unregistered files
