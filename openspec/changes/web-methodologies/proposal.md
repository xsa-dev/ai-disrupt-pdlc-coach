## Why

После диагностики и roadmap пользователь знает, **что** нужно улучшать, но сайт не объясняет, **как именно** применять практики AI-Disrupt PDLC. Нужен source-grounded каталог воспроизводимых методик и рабочих артефактов, который связывает рекомендации roadmap с конкретными действиями и не смешивает методики, модели управления, метрики и антипаттерны.

## What Changes

- Добавить статическую русскоязычную страницу `web/methodologies.html` в визуальном стиле существующих `diagnosis.html`, `roadmap.html` и `antipatterns.html`.
- Представить методики через карту жизненного цикла: Discovery → Specification → Execution → Validation → Outcome, со сквозным Governance Mesh.
- Включить в MVP 12 подтверждённых whitepaper элементов:
  1. PR/FAQ;
  2. Outcome Hypothesis;
  3. Адаптация или перепроектирование;
  4. Матрица применимости агента;
  5. Mob Elaboration;
  6. SDD-цикл;
  7. Human-in-the-loop Decision Map;
  8. Session Handoff Protocol;
  9. Eval-driven development;
  10. Evidence Bundle;
  11. R0–R5: риск-адаптивная лестница разрешений;
  12. Governance Mesh.
- Явно классифицировать каждый элемент как `method`, `artifact` или `governance-model`, чтобы не выдавать термин или модель за методику.
- Добавить фильтры по этапу PDLC и типу элемента.
- Для каждого элемента показывать назначение, условия и ограничения применимости, входы, последовательность действий, выходной артефакт, Definition of Done, связанные антипаттерны и точную ссылку на раздел и печатную страницу whitepaper. Если источник не задаёт ограничение применимости, UI должен явно говорить «В источнике не указано», а не добавлять авторское правило.
- Добавить навигационную ссылку «Методики» на существующие web-страницы и обратные связи с Roadmap и Антипаттернами.
- Сохранить реализацию полностью статической: HTML/CSS/JavaScript без backend и отдельного build pipeline.

### Non-goals

- Не переносить в MVP всю терминологию и все практики whitepaper.
- Не включать Tiny Teams, DORA/ADLC metrics, I/V Tempo Ratio, AI SRE, Guardian Agents и полный Agent Harness — это кандидаты следующей итерации.
- Не создавать LLM-рекомендатель, персональные аккаунты, серверное хранение или редактирование контента.
- Не выдавать авторский пересказ, внутренний кейс или придуманную практику за содержание whitepaper.
- Не менять логику диагностики, Roadmap, квиза и Telegram-бота в рамках этого change.

### Success criteria

- Каталог содержит ровно 12 MVP-элементов, и каждый имеет проверяемый source reference.
- Пользователь может отфильтровать каталог по этапу и типу без перезагрузки страницы.
- Каждая подробная карточка содержит все обязательные поля и читается на iPad mini без горизонтального скролла.
- Навигация между четырьмя web-разделами работает, а существующие страницы не получают duplicate IDs и JavaScript errors.
- Source/data integrity, HTML IDs, inline JavaScript и mobile viewport проверяются воспроизводимыми тестами.

## Capabilities

### New Capabilities

- `web-methodologies`: Source-grounded каталог методик, артефактов и governance-моделей AI-Disrupt PDLC с lifecycle-навигацией, фильтрами и подробными карточками.

### Modified Capabilities

Нет.

## Impact

- Новый файл: `web/methodologies.html`.
- Навигационные изменения: `web/diagnosis.html`, `web/roadmap.html`, `web/antipatterns.html`.
- Новый воспроизводимый web regression/source-integrity test.
- Новых runtime-зависимостей, API и backend-компонентов нет.
- Контентным source of truth остаётся исходный AI-Disrupt PDLC whitepaper; все утверждения MVP должны быть traceable к его разделам.
