# Tasks - Web Antipatterns Section

## Phase 1: OpenSpec
- [x] Создать change `web-antipatterns`
- [x] Написать proposal.md
- [x] Написать design.md
- [x] Написать tasks.md

## Phase 2: Сбор данных из книги (hardcoded)
- [x] Извлечь 7 подробных антипаттернов из раздела 7.4 (признак/фикс/горизонт)
- [x] Извлечь 22 антипаттерна реестра (№1–18 базовые, №19–22 управление)
- [x] Сформировать массив QUIZ (~58 вопросов: name + fix по каждому АП)

## Phase 3: Страница antipatterns.html
- [ ] Создать каркас страницы (head: Tailwind, Font Awesome, шрифты; верхнее меню)
- [ ] Hero-блок + легенда
- [ ] Секция 1: 7 подробных карточек (из JS-данных, рендеринг)
- [ ] Секция 2: реестр 22 + фильтр по типу
- [ ] Секция 3: КВИЗ (режимы Случайный / По билетам, фидбек, счёт)
- [ ] Кнопки навигации «К диагностике» / «К Roadmap»
- [ ] Мобильная адаптивность

## Phase 4: Интеграция меню
- [ ] В `diagnosis.html` добавить пункт «Антипаттерны»
- [ ] В `roadmap.html` добавить пункт «Антипаттерны»

## Phase 5: Проверка через туннель
- [ ] `curl` публичного URL `https://briefs-barcelona-vegetable-underground.trycloudflare.com/antipatterns.html` → HTTP 200
- [ ] Проверить наличие всех 29 описаний и работу квиза (логика в JS)
- [ ] Проверить меню на diagnosis.html / roadmap.html

## Phase 6: Git
- [ ] `git add` новых/изменённых файлов
- [ ] Коммит `web: add antipatterns section (page + quiz + nav)`

## Nice to have (не в этом change)
- Вопросы по уровням зрелости
- Прогресс/серия билетов в localStorage
