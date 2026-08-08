## Why

Публичные ссылки сайта сейчас зависят от временного Cloudflare quick tunnel и перестают работать после перезапуска. Это делает невозможным надёжный deeplink на Quiz и долговременный шаринг результатов. Проект уже является статическим web-приложением и совместим с GitHub Pages; для бесплатной публикации репозиторий должен стать публичным.

Одновременно текущий Quiz не имеет канонического URL-контракта: hash открывает секцию, но режим, билет, strict mode, воспроизводимый random seed и результат не кодируются в ссылке. Отображаемый номер случайного билета сейчас не является seed, а 62 вопроса разбиваются на 7 неравных билетов, где последний содержит только 2 вопроса.

## What Changes

### Public GitHub Pages delivery
- Классифицировать `coach/data/teams/*.json` как private runtime data и удалить их из всех публично достижимых исторических refs; будущие runtime JSON не отслеживать.
- Удалить из публичной истории 31 семейство generated agent integrations, а также `.github/prompts/**` и `.github/skills/**`; сохранить только явный public allowlist продукта и `.github/workflows/**`.
- Реализовать исполняемый fail-closed publish gate с pinned Gitleaks image, exact approved SHA, clean-tree/path-policy checks и повторной проверкой непосредственно перед repository creation и push.
- Создать публичный репозиторий `xsa-dev/ai-disrupt-pdlc-coach` только через прошедший gate и push ровно одобренного commit в `master`.
- Добавить hardened GitHub Actions deployment статического содержимого `web/` в GitHub Pages: immutable full-SHA action pins, branch/environment restriction, tests и artifact manifest до deploy.
- Добавить корневую точку входа `index.html`, ведущую на диагностику, и сохранить работу относительных ссылок под project subpath.
- Публиковать сайт по стабильному HTTPS URL `https://xsa-dev.github.io/ai-disrupt-pdlc-coach/`.
- Проверять deployment по реальному GitHub Actions run, Pages API и публичным HTTP/browser smoke tests.

### Quiz deeplinks
- Ввести версионированный URL-контракт для входа в Quiz, fixed ticket, strict mode и seeded random challenge.
- Зафиксировать полную URL grammar: допустимые сочетания, canonical order, defaults, duplicate policy, seed regex, invalid-state behavior и разделение relative route/absolute shared URL.
- Валидировать query parameters без runtime errors и не запускать Quiz автоматически без явного `autostart=1`.
- Сделать random challenge воспроизводимым через нормативные qv1 FNV-1a/Mulberry32/Fisher–Yates semantics и заранее рассчитанные golden vectors; random challenge содержит ровно 10 вопросов.
- Перераспределить 62 вопроса по фиксированным билетам без двухвопросного последнего билета и обновить UI-копирайт.
- Ввести `aipdlc.quiz.progress.v2` с versioned challenge identities; legacy v1 оставить неизменным и не выдавать его результаты за прохождение remapped qv1 tickets.

### Quiz and result sharing
- Добавить действия «Поделиться квизом» и «Поделиться результатом».
- Использовать Web Share API как progressive enhancement с точной error matrix: `AbortError` означает тихую отмену, остальные ошибки переходят к clipboard, затем к manual-copy fallback.
- Шарить результат как агрегат `score / total / percent`, режим и ссылку на тот же challenge.
- Поддержать read-only result deeplink с CTA «Пройти этот билет»; такой результат явно неподтверждён, валидируется и не изменяет localStorage получателя.
- Не включать в URL имя, ответы, assessment history или другие персональные данные.

## Capabilities

### New Capabilities
- `github-pages-delivery`: безопасная публикация публичного репозитория и статического сайта в GitHub Pages с проверяемым стабильным URL.
- `web-quiz-sharing`: версионированные Quiz deeplinks, воспроизводимые challenges и шаринг неподтверждённых результатов.

### Modified Capabilities
- Нет. Existing web shell, methodologies catalog, diagnosis and roadmap behavior remain unchanged outside navigation to the published origin.

## Impact

- GitHub: новый публичный repository/remote, Pages settings и Actions runs.
- `.github/workflows/`: Pages deployment workflow.
- `web/`: root entrypoint and Quiz URL/share UI/logic.
- `tests/`: URL parser, deterministic seed, result validation, localStorage isolation and real-browser deployment tests.
- `openspec/`: two new capability specs.
- Privacy: private team fixtures and generated integration families удаляются из всех публично достижимых refs до первого push; публичной становится только allowlisted history.
- Supply chain: Pages actions закрепляются на full commit SHA, а Gitleaks — на platform image digest и проверяемую версию.

## Non-Goals

- Собственный домен, `0xhash.ru`, Caddy или Cloudflare named tunnel.
- Backend, база результатов, пользовательские аккаунты или подтверждённые сертификаты.
- Защита client-side score от намеренной подделки.
- Динамические Telegram Open Graph previews с индивидуальным score.
- Миграция localStorage с временного `trycloudflare.com` origin.
- Автоматическая публикация secrets, `.env`, test dependencies, caches или локальных артефактов.
- Публикация private team assessments или generated agent integration families.
