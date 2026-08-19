# Proposal: Web Diagnosis Tool (retroactive spec for diagnosis.html)

## Why
Сайт уже содержит рабочий веб-инструмент диагностики зрелости команды
(`web/diagnosis.html`, 836 строк, ~31KB JS). Он реализует опрос L0-L5 / R0-R5,
генерацию отчёта (копирование в буфер через `copyReport()` / `navigator.clipboard`;
PDF-download не реализован — `jsPDF` подключён, но не инстанциируется), grounding
в книгу AI-Disrupt PDLC и связь с roadmap. Ранее существовавший change `mvp-diagnosis-scenario` описывал
Telegram-бота (нереализуемо на GitHub Pages) и получил NOT GO.

Этот change описывает **существующий веб-инструмент** (retroactive spec),
чтобы зафиксировать его поведение в OpenSpec и корректно закрыть цикл.

## What Changes
- Создаётся спецификация capability `diagnosis` (веб-инструмент).
- Описывает: опрос команды, оценку L0-L5/R0-R5, генерацию отчёта с grounding,
  связь с roadmap.

## Scope
Только спецификация веб-инструмента `diagnosis.html`. Без Telegram-бота
(он вне GitHub Pages по архитектурным причинам).

## Non-Goals
- Telegram-бот диагностики (отдельный проект, вне сайта).
- Серверное хранение отчётов (localStorage/PDF — клиентская генерация).
- Pause/resume сессии (веб-инструмент проходит за один заход).

## Verification
- `diagnosis.html` живой (HTTP 200), содержит question-container, results-screen,
  report-generation, L0-L5/R0-R5, grounding-ссылки.
