## Context

Существующие страницы отвечают на разные вопросы: diagnosis определяет текущее состояние, roadmap показывает направление изменения, antipatterns описывает ошибки. Между roadmap и antipatterns отсутствует практический слой «как выполнять изменение». Whitepaper содержит подходящие процессы, артефакты и governance-модели, но они распределены по разделам 1.7–1.8, 2.3, 2.10–2.13 и 4.3.

Проект не имеет frontend build pipeline: страницы реализованы самостоятельными HTML-файлами с Tailwind CDN и inline JavaScript. Решение должно сохранять этот контракт и работать в Safari на iPad mini.

## Goals / Non-Goals

**Goals:**

- Дать пользователю source-grounded каталог из 12 элементов MVP.
- Отделить методики от артефактов и governance-моделей.
- Организовать каталог вокруг lifecycle, а не алфавитного глоссария.
- Сделать каждую карточку воспроизводимой инструкцией с Definition of Done.
- Связать каталог с Roadmap и Антипаттернами.
- Добавить воспроизводимые content и browser regression gates.

**Non-Goals:**

- Перенос всей книги и всех терминов.
- Backend, аккаунты, синхронизация и серверное хранение.
- LLM-generated recommendations.
- Интерактивный мастер создания PR/FAQ или SDD.
- Изменение diagnosis, roadmap generation, quiz или Telegram flows.
- Копируемые шаблоны артефактов в первой версии; их можно добавить отдельным change после проверки каталога.

## Decisions

### 1. Одна статическая страница вместо отдельных detail routes

`web/methodologies.html` содержит hero, lifecycle map, фильтры, каталог и раскрываемые подробности.

**Почему:** соответствует текущему стеку, не требует router/build pipeline, сохраняет быстрый переход между карточками.

**Альтернатива:** отдельный HTML для каждой методики. Отклонено для MVP из-за дублирования навигации и 12 отдельных документов.

### 2. Lifecycle map + catalog вместо обычного глоссария

Верхний слой показывает Discovery → Specification → Execution → Validation → Outcome; Governance визуально проходит через весь путь. Выбор этапа фильтрует каталог.

**Почему:** методики становятся частью процесса и отвечают на вопрос «когда применять».

**Альтернатива:** алфавитный список. Отклонено: он не показывает последовательность применения.

### 3. Нативные раскрываемые панели вместо modal/drawer

Подробности реализуются доступными кнопками или `<details>`-панелями внутри карточек. Одновременно может быть открыто несколько элементов.

**Почему:** предсказуемая работа в Safari/WebView, естественная клавиатурная доступность, отсутствие focus-trap и проблем с высотой viewport на iPad.

**Альтернатива:** полноэкранный drawer/modal. Отклонено для MVP из-за дополнительной сложности accessibility и mobile state.

### 4. Контент как единый JavaScript data registry

Каждый элемент имеет поля:

```text
id, titleRu, titleEn, kind, stages, purpose,
whenToUse, whenNotToUse, inputs, steps, output,
doneCriteria, relatedAntipatterns, sourceSections
```

Рендер карточек и фильтрация используют один registry; текст не дублируется в нескольких DOM-блоках.

**Почему:** позволяет автоматически проверить количество, уникальность, обязательные поля, source references и связи с антипаттернами.

**Альтернатива:** вручную написанные 12 HTML-карточек. Отклонено из-за риска расхождения структуры и ошибок в ссылках.

### 5. Зафиксированная source map MVP

| Entry | Kind | Whitepaper source |
|---|---|---|
| PR/FAQ | artifact | §1.8 |
| Outcome Hypothesis | artifact | §1.8–1.9 |
| Adaptation vs Redesign | method | §1.7–1.8 |
| Agent Applicability Matrix | method | §1.8 |
| Mob Elaboration | method | §2.3 |
| SDD Cycle | method | §2.3, “Процесс SDD-цикла” |
| Human-in-the-loop Decision Map | artifact | §2.3, SDD principles/cycle |
| Session Handoff Protocol | artifact | §2.10 |
| Eval-driven Development | method | §2.11 |
| Evidence Bundle | artifact | §2.11 |
| R0–R5 Autonomy Ladder | governance-model | §4.3 |
| Governance Mesh | governance-model | §2.13 and §5.1 |

Контент может быть короче источника, но не может добавлять непроверенные шаги как нормативную часть книги.

### 6. Минимальная интеграция с другими разделами

В рамках MVP:

- добавляется единый пункт меню «Методики» на четыре страницы;
- methodologies ссылается на Roadmap и Антипаттерны;
- related antipatterns проверяются против registry по точному имени;
- recommendation engine «уровень → методики» не создаётся.

### 7. Проверка важнее визуального success-report

До завершения change должны выполняться сохранённые тесты:

- OpenSpec validation;
- 12 уникальных entries;
- обязательные поля и source sections;
- related antipattern integrity;
- duplicate DOM IDs;
- JavaScript syntax;
- internal links;
- keyboard interaction;
- browser check при ширине 744 CSS px;
- публичный HTTP 200 после deployment.

## Risks / Trade-offs

- **[Риск]** Каталог превратится в пересказ книги → **Митигация:** фиксированная source map и обязательные source references.
- **[Риск]** Сущности будут ошибочно называться методиками → **Митигация:** обязательный `kind` и отдельные UI labels.
- **[Риск]** Inline data registry увеличит HTML → **Митигация:** 12-entry scope; вынос данных рассматривается только при заметном росте.
- **[Риск]** Связи с antipattern registry разойдутся → **Митигация:** automated exact-name integrity check.
- **[Риск]** Detail panels станут слишком длинными на мобильном → **Митигация:** collapsed-by-default, короткие списки, отсутствие вложенных модалок.
- **[Риск]** Источник содержит неоднозначную границу между методикой и артефактом → **Митигация:** taxonomy явно хранится в данных; спорные элементы не включаются без подтверждения.

## Migration Plan

1. Добавить страницу и registry без изменения существующего поведения.
2. Подключить навигацию на существующих страницах.
3. Запустить static/source/browser regression suite.
4. Проверить локальную страницу.
5. Опубликовать через текущий Cloudflare quick tunnel и проверить публичный URL.
6. При регрессии удалить links на новую страницу и сам новый HTML; существующие данные и flows не мигрируются.

## Open Questions for MVP Approval

1. Подтвердить пользовательское название меню и страницы: **«Методики»** (рекомендуется) или «Практики».
2. Подтвердить список из 12 элементов без Guardian Agents и Agent Harness в первой версии.
3. Подтвердить раскрываемые inline-панели вместо fullscreen drawer/modal.
4. Подтвердить отсутствие копируемых шаблонов в MVP; отдельные шаблоны предлагаются второй итерацией.
5. Подтвердить URL `methodologies.html`.
