# Disrupt PDLC Coach

Внутренний Telegram-коуч для инженерных команд по методологии **AI-Disrupt PDLC**.

## Текущее состояние (MVP Diagnosis)

Реализован первый сценарий — **Диагностика зрелости команды** (L0–L5 + R0–R5).

### Что работает сейчас
- Структурированные вопросы на основе книги
- Честная оценка уровня с обоснованием
- Генерация качественного Markdown-отчёта
- Сохранение профиля команды (JSON)
- CLI-симулятор для тестирования
- Базовый Telegram-бот (`/diagnosis`, `/status`, `/team`)

### Структура проекта
```
coach/
├── core/
│   ├── levels.py          # L0-L5 + R0-R5 определения из книги
│   ├── assessment.py      # Логика оценки
│   ├── report.py          # Генератор отчётов
│   └── team_context.py    # Профили команд
├── telegram/
│   └── diagnosis_bot.py   # Telegram бот
├── simulate_diagnosis.py  # CLI симулятор
└── data/teams/            # JSON профили команд
```

## Как запустить

### 1. Симулятор (без Telegram)
```bash
PYTHONPATH=. python coach/simulate_diagnosis.py
```

### 2. Telegram бот
```bash
export TELEGRAM_BOT_TOKEN="your_token"
PYTHONPATH=. python -m coach.telegram.diagnosis_bot
```

## Следующие шаги (по OpenSpec)
См. `openspec/changes/mvp-diagnosis-scenario/`

После стабилизации Diagnosis будет создан отдельный change для генерации Roadmap.

## Принципы
Всегда соблюдать:
- Среда важнее модели
- Честная оценка зрелости
- Человек — намерение, агент — реализация
- Валидация встроена

## Связанные документы
- `PLAN.md` — исходный детальный план
- `openspec/specs/` — текущие спецификации (OpenSpec)
- whitepaper: `/home/admin/.hermes/cache/whitepaper_full_ru.txt`
```

Now update the OpenSpec change with a small delta or note.

To finalize this iteration, let's show the current OpenSpec status.