## Why

Хотя общий двухстрочный site header уже одинаков на четырёх страницах, `methodologies.html` добавляет сразу под ним уникальный декоративный hero с иконкой, eyebrow и увеличенным заголовком. Визуально этот блок воспринимается как третий этаж шапки, поэтому страница «Методики» всё ещё выглядит иначе.

## What Changes

- Заменить уникальный decorative hero страницы «Методики» на обычный компактный page intro.
- Удалить из page intro иконку и eyebrow `AI-Disrupt PDLC`.
- Привести размер заголовка и вертикальный ритм к обычной иерархии продуктовых страниц.
- Не менять общий site header, каталог, фильтры, registry или JavaScript.

## Capabilities

### Modified Capabilities
- `web-methodologies`: верхняя часть страницы начинается с общего site header и компактного page intro без уникального третьего header-этажа.

## Impact

- `web/methodologies.html`
- `tests/test_web_methodologies.py`
- responsive/public visual QA
