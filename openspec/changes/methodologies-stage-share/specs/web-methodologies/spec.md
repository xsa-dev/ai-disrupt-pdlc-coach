# web-methodologies Specification (delta)

## ADDED Requirements

### Requirement: Stage selection is deep-linkable
The methodologies page SHALL reflect the selected lifecycle stage in the URL as `?stage=<StageName>` and SHALL restore the stage filter from that parameter on load. This applies (ДОЛЖЕН) to all six stages plus `all`.

#### Scenario: Stage restored from URL on load
- **WHEN** the page is opened with `?stage=Specification`
- **THEN** the stage filter SHALL be set to Specification and only Specification methodologies SHALL be shown

#### Scenario: Changing stage updates the URL
- **WHEN** the visitor selects a different stage
- **THEN** the URL query SHALL update to `?stage=<StageName>` via `history.replaceState` without a full page reload

#### Scenario: Unknown or missing stage falls back to all
- **WHEN** the page is opened without `?stage=` or with an unrecognized value
- **THEN** the filter SHALL default to `all` (no error)

### Requirement: Share current stage and its required steps
The methodologies page SHALL provide a "Поделиться" control that builds a share payload for the currently selected stage: a deep-link URL (`?stage=<StageName>`) plus a text summary listing the stage name and, for every methodology of that stage, its title and its full `steps` checklist.

#### Scenario: Share payload for a concrete stage
- **WHEN** a concrete stage is selected and the visitor activates "Поделиться"
- **THEN** the payload SHALL contain the deep-link URL AND the stage name AND, for each methodology belonging to that stage, its title followed by all of its `steps`

#### Scenario: Share when stage is "all"
- **WHEN** the stage is `all` and the visitor activates "Поделиться"
- **THEN** the payload SHALL contain the page link and a hint to pick a stage, WITHOUT expanding the full checklist of every stage

### Requirement: Share uses Web Share API with clipboard fallback
The share control SHALL use the Web Share API (`navigator.share`) when available, and SHALL fall back to copying the payload to the clipboard with a visible confirmation when it is not.

#### Scenario: Native share when supported
- **WHEN** `navigator.share` is available (mobile / in-app WebView) and the control is activated
- **THEN** the native share sheet SHALL be invoked with the share payload

#### Scenario: Clipboard fallback when unsupported
- **WHEN** `navigator.share` is unavailable (typical desktop)
- **THEN** the payload SHALL be copied to the clipboard AND a visible confirmation SHALL be shown
