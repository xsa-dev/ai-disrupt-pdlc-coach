## Why

Четыре связанные web-страницы используют разные структуры, отступы, active states и наборы строк в верхней области, поэтому интерфейс визуально «прыгает» при навигации. Единая оболочка нужна сейчас, потому что каталог методик завершил основной пользовательский маршрут «Диагностика → Roadmap → Методики → Антипаттерны».

## What Changes

- Ввести единый двухуровневый header contract для четырёх страниц.
- Использовать одинаковые `max-w-5xl`, responsive horizontal padding и vertical rhythm.
- Сделать навигацию семантической и одинаковой: один порядок ссылок, единый active state, `aria-current="page"`.
- Сохранить page-specific icon, subtitle и необходимые действия, не позволяя им менять высоту header на mobile.
- Проверить отсутствие horizontal overflow на 390 и 744 CSS px и визуальное выравнивание на desktop.

### Non-goals

- Переработка основного содержимого страниц.
- Изменение логики диагностики, roadmap, каталога методик или квиза.
- Создание общего frontend build pipeline или component framework.
- Изменение whitepaper-derived content.

## Capabilities

### New Capabilities
- `web-shell`: Общая навигация и визуально стабильная header-оболочка связанных статических страниц.

### Modified Capabilities

Нет.

## Impact

Изменяются `web/diagnosis.html`, `web/roadmap.html`, `web/methodologies.html`, `web/antipatterns.html` и regression/headless tests. Backend, Telegram-сценарии, данные и публичные маршруты не меняются.

## Success Criteria

- Все четыре страницы соответствуют одному автоматизированному header contract.
- На каждой странице ровно один active nav link с корректным `aria-current="page"`.
- Контейнеры nav/header/main выровнены по `max-w-5xl` и responsive padding.
- Реальный Chrome не обнаруживает horizontal overflow на ширине 390 и 744 CSS px.
- Desktop screenshots подтверждают одинаковую геометрию двух строк header.
