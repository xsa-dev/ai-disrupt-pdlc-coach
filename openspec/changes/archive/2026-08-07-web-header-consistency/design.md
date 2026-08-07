## Context

Сайт состоит из четырёх независимых статических HTML-файлов без shared component build step. Исторически их top navigation и brand rows развивались отдельно. Требуется выровнять геометрию без переноса page logic и без frontend pipeline.

## Goals / Non-Goals

**Goals:**
- Один semantic и визуальный contract верхней области.
- Одинаковая ширина, horizontal padding, vertical rhythm и active navigation.
- Устойчивость на desktop, iPad mini и phone.
- Сохранение узнаваемости страницы через subtitle/icon.

**Non-Goals:**
- Shared template engine или runtime component injection.
- Редизайн page content.
- Перенос page-specific JavaScript.

## Decisions

### 1. Дублированный статический contract вместо runtime include

Каждая страница получит одинаковую HTML-структуру `<header data-site-header>`, потому что сайт должен оставаться открываемым как набор статических файлов. Альтернатива с JavaScript include отклонена: она создаёт flash, усложняет offline/local serving и добавляет новую точку отказа.

### 2. Две фиксированные строки

Первая строка содержит semantic `<nav aria-label="Основная навигация">`; вторая — brand identity с icon, общим названием и page subtitle. Обе используют `max-w-5xl mx-auto px-4 sm:px-6`.

### 3. Единый active state

Активная ссылка получает `aria-current="page"`, emerald text и bottom border. Остальные ссылки имеют одинаковый neutral state. Page-specific hover colors не допускаются.

### 4. Стабильная responsive геометрия

Nav допускает controlled horizontal wrapping/scroll behavior без document overflow. Brand row сохраняет минимальную высоту. Page-specific actions скрываются ниже `md` и не меняют mobile header height; необходимые мобильные entrypoints остаются в page content.

### 5. Page identity без layout drift

Icon glyph и subtitle различаются, но размер icon box, title typography, spacing и emerald surface одинаковы.

## Risks / Trade-offs

- [Static duplication может снова разойтись] → Regression test сравнивает нормализованный contract четырёх страниц.
- [Длинная навигация тесна на phone] → Compact gaps, responsive padding и проверка real Chrome на 390 px.
- [Скрытие header actions ухудшит mobile discoverability] → Критичные действия остаются доступными в content sections; тест проверяет ссылки/кнопки страницы.

## Migration Plan

1. Добавить failing structural tests.
2. Заменить только верхние header blocks.
3. Запустить существующие page tests.
4. Проверить real Chrome screenshots и overflow.
5. Проверить public tunnel parity.
6. Архивировать change штатным OpenSpec workflow.

Rollback: откатить отдельный implementation commit; page data и logic не затрагиваются.

## Open Questions

Нет — contract ограничен структурой и responsive геометрией.
