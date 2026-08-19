# Proposal: Web Roadmap Tool (retroactive spec for roadmap.html)

## Why
Сайт уже содержит рабочий веб-инструмент построения Roadmap трансформации
команды (`web/roadmap.html`, ~30KB). Он реализует выбор текущего/целевого
уровня (currentL/targetL), генерацию этапов с практиками и gate-критериями,
антипаттерны, экспорт в PDF и Markdown, адаптивную вёрстку, кнопку «Пример»
и возврат на диагностику. Ранее существовавший change `web-roadmap` описывал
те же вещи, но с устаревшими открытыми задачами (proposal/design «написать»,
интеграция) при уже живой странице — получил NOT GO.

Этот change описывает **существующий веб-инструмент** (retroactive spec).

## What Changes
- Создаётся спецификация capability `web-roadmap` (веб-инструмент).
- Описывает: выбор уровней, генерацию roadmap (практики, gate-критерии,
  антипаттерны), экспорт, связь с диагностикой.

## Scope
Только спецификация веб-инструмента `roadmap.html` (без Telegram-бота).

## Non-Goals
- Telegram-бот roadmap (отдельный проект, вне GitHub Pages).
- Серверное хранение roadmap (клиентская генерация + PDF/MD экспорт).
- Точные данные из levels.py (сейчас хардкод в JS — deferred).

## Verification
- `roadmap.html` живой (HTTP 200), содержит currentL/targetL, practices,
  gate-критерии, антипаттерны, PDF/MD экспорт, адаптив, кнопку «Пример».
