# AI Disrupt PDLC Coach

Инструменты для диагностики зрелости инженерных команд и статический web-справочник по методологии **AI-Disrupt PDLC**.

## Возможности

- Диагностика зрелости команды по уровням L0–L5 и R0–R5.
- Генерация Markdown-отчёта и Roadmap.
- Справочник методик и каталог антипаттернов.
- Интерактивный Quiz с фиксированными и воспроизводимыми seeded-билетами.
- Telegram-бот и CLI-симулятор для локального использования.

## Структура проекта

```text
coach/
├── core/
│   ├── levels.py          # определения L0–L5 и R0–R5
│   ├── assessment.py      # логика оценки
│   ├── report.py          # генератор отчётов
│   └── team_context.py    # локальные профили команд
├── telegram/
│   └── diagnosis_bot.py   # Telegram-бот
└── simulate_diagnosis.py  # CLI-симулятор

web/
├── diagnosis.html
├── roadmap.html
├── methodologies.html
├── antipatterns.html
└── vendor/                # проверяемые локальные runtime assets
```

`coach/data/teams/*.json` — **private runtime data**. Эти файлы игнорируются, не входят в публичный repository и не публикуются через GitHub Pages.

## Локальный запуск

### Web

```bash
python3 -m http.server 8080 --directory web
```

Откройте `http://127.0.0.1:8080/`.

### CLI-симулятор

```bash
PYTHONPATH=. python3 coach/simulate_diagnosis.py
```

### Telegram-бот

```bash
cp .env.example .env
# Заполните TELEGRAM_BOT_TOKEN только локально.
PYTHONPATH=. python3 -m coach.telegram.diagnosis_bot
```

`.env` и реальные credentials запрещено коммитить или добавлять в логи.

## Публичный статический сайт

Планируемый canonical URL:

```text
https://xsa-dev.github.io/ai-disrupt-pdlc-coach/
```

Статус URL считается **verified** только после успешного workflow, HTTP-проверки всех файлов по SHA-256 manifest и browser QA на реальном Pages origin.

GitHub Pages публикует только содержимое `web/`:

- HTML, CSS, JavaScript и статические assets работают в браузере;
- Python и Telegram-бот на Pages не запускаются;
- на Pages нет базы данных, серверных sessions и серверной проверки Quiz score;
- secrets и локальные team profiles не входят в deployment artifact.

Результат Quiz, открытый из shared URL, является неподтверждённым: score берётся из URL, может быть изменён отправителем и не проверяется сервером.

## Безопасная публикация

Первый публичный push выполняется только через fail-closed gate:

1. кандидат фиксируется точным full commit SHA;
2. проверяются clean tree, разрешённые paths и все reachable Git refs;
3. запускается pinned Gitleaks по history и worktree;
4. проверяется deterministic manifest каталога `web/`;
5. два независимых reviewer дают GO на тот же SHA;
6. пустой публичный repository создаётся без push;
7. gate повторяется, затем отправляется только `approved-sha:refs/heads/master`.

Workflow GitHub Pages использует immutable full-SHA action pins, least-privilege permissions и публикует artifact только после тестов и manifest audit.

## Incident response при публичной утечке

Удаление Pages или repository **не отзывает** уже скачанные clones, forks и caches.

При обнаружении credential или private data после публикации:

1. немедленно отозвать или ротировать credential;
2. отключить Pages и заморозить дальнейшие pushes;
3. удалить чувствительные данные и переписать публичную history;
4. выполнить повторный secret/privacy gate;
5. получить независимый security GO перед повторной публикацией;
6. зафиксировать, что сторонние копии не могут быть гарантированно удалены.

Credential rotation выполняется раньше history cleanup.

## Ограничения GitHub Pages

Для этой публикации учитываются:

- размер опубликованного сайта — не более **1 GB**;
- timeout deployment — **10 минут**;
- soft bandwidth limit — **100 GB в месяц**;
- soft limit Pages в 10 builds/hour не применяется тем же способом к custom GitHub Actions publishing, однако действуют собственные лимиты GitHub Actions.

Custom domain в текущий scope не входит.

## Разработка и OpenSpec

Активные changes находятся в `openspec/changes/`. Перед реализацией и публикацией используются:

```bash
openspec validate <change> --type change
openspec validate --all
```

Основные документы:

- `PLAN.md` — исходный продуктовый план;
- `openspec/specs/` — принятые capability specs;
- `openspec/changes/` — активные изменения и acceptance tasks.

## Принципы

- Среда важнее модели.
- Честная оценка зрелости.
- Человек определяет намерение, агент выполняет реализацию.
- Валидация встроена в delivery path.
- Положительный лог не считается доказательством доставки.
