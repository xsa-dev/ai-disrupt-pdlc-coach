## Context

`methodologies.html` already uses the same semantic `data-site-header` contract as the other product pages. The remaining mismatch is the first section inside `<main>`: unlike the other pages it includes a decorative icon, uppercase eyebrow and the largest heading scale, making it read as an extension of the header.

## Goals / Non-Goals

**Goals:**
- Make the boundary between shared header and page content visually consistent.
- Keep the methodologies title and explanatory copy.
- Preserve all catalog behavior and source-grounded content.

**Non-Goals:**
- Redesign cards, filters or lifecycle controls.
- Change the shared site header again.
- Modify registry data or JavaScript.

## Decisions

### Use a plain page intro
The first section inside `<main>` will contain only the page `<h1>` and explanatory paragraph. It will carry `data-page-intro` for regression testing.

### Remove unique header-like decoration
The compass icon and `AI-Disrupt PDLC` eyebrow will be removed. The heading scale will be `text-3xl sm:text-4xl`, avoiding the unique `sm:text-5xl` hierarchy.

### Keep spacing local
Only the intro section changes. The existing `main` container and lifecycle/catalog sections remain intact.

## Risks / Trade-offs

- The page loses one decorative brand cue; this is intentional because the shared header already supplies the brand.
- Static duplicated markup can drift; a structural regression test locks the intro contract.

## Verification

- RED/GREEN structural test.
- Existing methodologies tests and headless interactions.
- Chrome screenshots at desktop and 390 px.
- Public HTTP 200 and byte parity.
