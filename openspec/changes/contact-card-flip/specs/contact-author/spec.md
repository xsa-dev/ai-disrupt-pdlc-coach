# contact-author Specification (delta)

## REMOVED Requirements

### Requirement: Modal shows contacts and message form
The dialog with contacts and a message textarea/send button is removed. The contact UI now shows a flip-card business card instead of a message form.

### Requirement: Message submission without backend
Message submission (mailto fallback + Formspree `data-contact-endpoint` POST) is removed. The contact card shows static contact links only — no message form, no network POST.

## MODIFIED Requirements

### Requirement: Modal is accessible and closable
The "Связь с автором" trigger SHALL open a flip-card overlay (not a message-form dialog). The overlay SHALL close on ESC, overlay click, and close button; focus SHALL return to the trigger on close. While open, background content SHALL be inert/`aria-hidden` and background scroll disabled. The flip-card SHALL be flippable by pointer (tap and horizontal drag/swipe, unified for touch and mouse) and keyboard-activatable (the card face is a button or has `tabindex=0` + Enter/Space to flip).

#### Scenario: Card opens and is closable
- **WHEN** the trigger is activated
- **THEN** a flip-card overlay appears showing the front face (contacts)
- **AND** it closes on ESC / overlay click / close button, returning focus to trigger

#### Scenario: Card flips via keyboard
- **WHEN** the card face is focused and Enter/Space is pressed
- **THEN** the card flips to the back face

#### Scenario: Card flips via pointer drag
- **WHEN** the card is dragged/swiped horizontally past a threshold (or tapped)
- **THEN** the card flips to the other face

## ADDED Requirements

### Requirement: Contact card shows contacts on front face
The flip-card front face SHALL be styled as a premium (Apple Wallet–style) business card and SHALL show the author's contacts as clickable links: Telegram (`@alxy_tg`), GitHub (`xsa-dev`), Email (`mailto:saleksey67@gmail.com`), plus the subtitle "разработка сайта · xsa-dev" and a hint "Нажмите, чтобы перевернуть". The front face SHALL use a blurred bokeh rendering of the decorative background as a full-card backdrop, clipped to the card's rounded corners, with a translucent veil keeping text/contacts readable.

#### Scenario: Front face content
- **WHEN** the card is open (front)
- **THEN** it SHALL show Telegram, GitHub, Email links, the subtitle, and a flip hint over the blurred backdrop, with rounded corners and no background bleed past them

### Requirement: Card flips to decorative back face
The flip-card back face SHALL show a decorative full-card background (`web/contact-card-bg.svg`, a black dome of gradient arrow-beads), the author's GitHub avatar (`https://github.com/xsa-dev.png`) in a framed badge near the top, and the wordmark "AI Disrupt PDLC" with the line "Спасибо, что заглянули" on readable dark pills. On avatar load error a graceful monogram placeholder SHALL show.

#### Scenario: Back face decorative content
- **WHEN** the card is flipped
- **THEN** the back face SHALL display the decorative background, the framed avatar near the top (not overlapping the close button), and the wordmark/line on readable pills, or a monogram placeholder on avatar load error

### Requirement: No message form and no runtime network dependency
The contact card SHALL NOT include any message form, Formspree endpoint, or network POST, and SHALL NOT introduce a new CDN runtime dependency; the decorative background SHALL be a local static asset (`web/contact-card-bg.svg`).

#### Scenario: No submission path
- **WHEN** the contact card is open on either face
- **THEN** there SHALL be no textarea/send button and no outbound POST; only static links and a local SVG asset are used
