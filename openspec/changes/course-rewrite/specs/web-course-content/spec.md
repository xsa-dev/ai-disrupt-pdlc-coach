# web-course-content Specification (delta)

## ADDED Requirements

### Requirement: Course text uses plain, jargon-free language
All 8 course modules SHALL be written in plain Russian without slang or in-group jargon, so a reader new to OpenSpec can follow without prior context.

#### Scenario: Module readable by a newcomer
- **WHEN** a reader with no OpenSpec background reads any module
- **THEN** the text SHALL explain concepts in everyday language (technical OpenSpec terms kept as literals, e.g. `SHALL`, `/opsx:explore`)

### Requirement: Eight-module structure is preserved
The rewrite SHALL keep the existing 8-module structure (no module added or removed).

#### Scenario: Module count unchanged
- **WHEN** the rewritten course is rendered
- **THEN** it SHALL present exactly 8 modules in the original order

### Requirement: Diagrams illustrate transitions between modules
Between modules the course SHALL include visual diagrams (inline SVG or CSS, no external assets) that illustrate the OpenSpec lifecycle, delta-spec structure, or the idea→archive flow.

#### Scenario: A diagram between modules
- **WHEN** the reader reaches the boundary between two modules
- **THEN** a self-contained inline diagram SHALL be shown (no external network dependency)

### Requirement: Examples are concrete, not abstract
Each conceptual module SHALL include at least one concrete, realistic example (a command, a spec snippet, or a scenario) rather than only abstract description.

#### Scenario: Concrete example present
- **WHEN** a module introduces a concept (e.g. delta-spec)
- **THEN** it SHALL show a concrete example snippet or command
