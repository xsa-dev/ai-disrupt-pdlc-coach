# web-glossary Specification Delta

## ADDED Requirements

### Requirement: Methodology citation reference block
The glossary page (`web/glossary.html`) SHALL provide a dedicated citation reference box containing the official citation sample formatted according to the copyright holder's guidelines, an interactive button to copy the citation to the clipboard, and an explicit reference to the terms of material use at `https://aipdlc.ru/ru/legal-info`.

1. **Accessibility (a11y):** The copy button (`#copy-citation-btn`) SHALL have an explicit `aria-label`, visible focus indicator (`focus-visible`), and accessible feedback state updating button text and announcing success.
2. **Safe Clipboard API with Fallback:** The copy action SHALL attempt `navigator.clipboard.writeText` when available; in non-secure or unsupported environments, it SHALL fall back to a hidden textarea selection (`document.execCommand('copy')`) so clipboard copying never throws an uncaught error.
3. **Safe External Navigation:** The link to `https://aipdlc.ru/ru/legal-info` SHALL declare `target="_blank"` and `rel="noopener"`.

#### Scenario: User views and copies the citation reference
- **WHEN** the user opens `web/glossary.html`
- **THEN** a container with `data-citation-box` is visible
- **AND** it contains the sample text "Меньшов К. А. AI-Disrupt PDLC. Инженерия намерения. Новая архитектура генеративной разработки ПО. — ПАО Сбербанк, 2026. — URL: https://aipdlc.ru/ru/ (дата обращения: ДД.ММ.ГГГГ)."
- **AND** the button `#copy-citation-btn` has `aria-label="Скопировать образец библиографической ссылки"`
- **AND** clicking `#copy-citation-btn` copies the citation text to the clipboard and provides visual feedback ("Скопировано!")
- **AND** the link to `https://aipdlc.ru/ru/legal-info` has `target="_blank"` and `rel="noopener"`
