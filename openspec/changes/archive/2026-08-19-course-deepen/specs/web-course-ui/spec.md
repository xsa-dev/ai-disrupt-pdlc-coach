# web-course-ui Specification (delta)

## ADDED Requirements

### Requirement: Course code blocks use Darcula palette with syntax highlighting
`web/course-openspec.html` SHALL render code blocks using the Darcula
(IntelliJ) palette — background `#282a36`, base text `#A9B7C6`, with syntax
highlight classes: keywords `#CC7832`, strings `#6A8759`, comments `#808080`,
numbers `#6897BB`. Syntax-highlight spans SHALL be applied to code content.

#### Scenario: Code block shows Darcula colors
- **WHEN** a code block (`.translation-code` / `pre`) renders
- **THEN** its background resolves to `#282a36` and keyword/string/comment tokens use the Darcula colors above

### Requirement: Course covers archive mechanics in practice
`web/course-openspec.html` SHALL include a module explaining what actually
happens on archive: delta specs merge into `openspec/specs/`, and the change
folder moves to `openspec/changes/archive/YYYY-MM-DD-<name>/`.

#### Scenario: Learner reads the archive module
- **WHEN** the learner reaches the archive module
- **THEN** it states that archive folds delta into the source of truth and timestamps the change folder

### Requirement: Course teaches writing good scenarios
`web/course-openspec.html` SHALL include a module on writing strong
GIVEN/WHEN/THEN scenarios, including the anti-pattern of vague requirements
(e.g. "handle gracefully") and the fix of observable, concrete scenarios.

#### Scenario: Learner studies scenario quality
- **WHEN** the learner reaches the scenarios module
- **THEN** it contrasts a vague requirement with a concrete GIVEN/WHEN/THEN example

### Requirement: Course provides additional quizzes for deeper retention
`web/course-openspec.html` SHALL include at least one extra multiple-choice
quiz beyond the baseline (specifically reinforcing delta-spec ADDED/MODIFIED/
REMOVED semantics), plus quizzes in the new archive and scenarios modules.

#### Scenario: Extra quiz present on delta module
- **WHEN** the learner reviews the delta-spec module
- **THEN** a quiz reinforces when to use ADDED vs MODIFIED vs REMOVED
