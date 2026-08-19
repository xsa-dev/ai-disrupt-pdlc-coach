# contact-author Specification

## Purpose
Описывает клиентский компонент «Связь с автором»: доступную модалку с контактами и формой отправки сообщения на статичном сайте без бэкенда.

## ADDED Requirements

### Requirement: Contact entry point is present on every page
Сайт SHALL предоставлять единый, видимый и доступный с клавиатуры триггер «Связь с автором» на каждой опубликованной странице (`index.html`, `diagnosis.html`, `antipatterns.html`, `methodologies.html`, `roadmap.html`), включая навигацию под project subpath.

#### Scenario: Trigger is reachable
- **WHEN** посетитель открывает любую страницу сайта
- **THEN** на странице присутствует активируемый элемент «Связь с автором»
- **AND** он доступен с клавиатуры (focusable, активируется Enter/Space)

### Requirement: Modal shows contacts and message form
При активации SHALL открываться диалог с блоком контактов (Telegram `@alxy_tg`, GitHub `xsa-dev`, email `saleksey67@gmail.com`) и текстовым полем сообщения с кнопкой «Отправить».

#### Scenario: Dialog content
- **WHEN** триггер активирован
- **THEN** диалог содержит перечисленные контакты и поле сообщения
- **AND** диалог имеет `role="dialog"` и `aria-modal="true"`

### Requirement: Modal is accessible and closable
Диалог SHALL закрываться по ESC, по клику на оверлей и по кнопке закрытия; фокус SHALL оставаться внутри диалога пока он открыт (focus-trap), а при закрытии возвращаться к триггеру. Пока диалог открыт, контент страницы SHALL быть помечен `inert`/`aria-hidden` и отключён фоновый скролл.

#### Scenario: Keyboard close
- **WHEN** диалог открыт и пользователь нажимает ESC
- **THEN** диалог закрывается и фокус возвращается к триггеру

#### Scenario: Focus containment
- **WHEN** диалог открыт
- **THEN** Tab-цикл не выходит за пределы диалога

### Requirement: Message submission without backend
Отправка сообщения SHALL работать без серверной части. По умолчанию SHALL формироваться `mailto:` с предзаполненными `subject` и `body` и открываться почтовый клиент. Если у диалога задан `data-contact-endpoint` (публичный `https://` URL без credentials), сообщение SHALL POST-иться по этому URL через `fetch` с `Content-Type: application/json` и `Accept: application/json`.

#### Scenario: Default mailto path
- **WHEN** `data-contact-endpoint` не задан и пользователь нажимает «Отправить» с непустым сообщением
- **THEN** не выполняется сетевых запросов
- **AND** инициируется `mailto:saleksey67@gmail.com` с предзаполненным subject/body

#### Scenario: Optional webhook path (Formspree-compatible)
- **WHEN** задан `data-contact-endpoint` и сообщение непустое
- **THEN** выполняется POST `application/json` с телом `{"email": <from>, "message": <text>, "_subject": "...", "newsletter": "yes"|"no"}`
- **AND** при ответе со статусом 2xx и `ok:true` пользователю показывается подтверждение отправки

#### Scenario: Webhook failure falls back to mailto
- **WHEN** webhook POST завершается сетевой ошибкой или non-2xx ответом
- **THEN** сообщение НЕ теряется: выполняется fallback на `mailto:` (или показывается видимая ошибка с кнопкой «открыть почту»)

### Requirement: No secrets and no new CDN runtime dependency
Компонент SHALL не содержать секретов в репозитории. Endpoint (если используется) SHALL задаваться через `data-` атрибут как публичный `https://` URL без credentials. Компонент SHALL не добавлять новых runtime-зависимостей от внешних CDN.

#### Scenario: Mailto default works offline
- **WHEN** сайт открыт без доступа к сети
- **THEN** модалка открывается и `mailto:` формируется корректно

#### Scenario: Endpoint is https-only
- **WHEN** задан `data-contact-endpoint`
- **THEN** он начинается с `https://` и не содержит credentials (user:pass) в URL
