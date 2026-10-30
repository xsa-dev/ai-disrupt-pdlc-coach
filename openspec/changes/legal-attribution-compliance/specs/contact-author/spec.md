# contact-author Specification Delta

## ADDED Requirements

### Requirement: Contact card back face attribution, disclaimer, and polished glassmorphism styling
The flip-card back face SHALL display explicit attribution identifying **Кирилл Меньшов (ПАО Сбербанк)** as the author of the concept and **xsa-dev** as the site developer, along with a disclaimer confirming the non-commercial educational citation of materials from `aipdlc.ru`. The attribution and disclaimer pills SHALL use polished emerald glassmorphism styling (`rgba(4, 18, 13, 0.78)` background, emerald border `rgba(52, 211, 153, 0.22)`, backdrop blur) with balanced vertical spacing that prevents overlap or clipping on mobile viewports.

#### Scenario: Back face attribution and polished styling are rendered
- **WHEN** the user flips the contact card to the back face
- **THEN** the attribution section displays "Автор концепции: Кирилл Меньшов (ПАО Сбербанк)" and "Разработка сайта: xsa-dev"
- **AND** the disclaimer text states "Отказ от ответственности: независимый некоммерческий образовательный инструмент. Цитирование материалов aipdlc.ru."
- **AND** the badges render with semi-transparent glassmorphism backdrops and rounded corners without clipping the framed avatar or close button
