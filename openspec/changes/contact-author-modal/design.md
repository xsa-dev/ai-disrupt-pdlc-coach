# Design: Contact Author Modal

## Context
Статичный сайт (5 HTML-страниц, Tailwind через локальный `vendor/tailwind-cdn.js`, Font Awesome завендорен). Бэкенда нет. Нужен единый клиентский компонент «Связь с автором», не ломающий существующий деплой и защиту ветки `master`.

## Goals / Non-Goals
- **Goals:** кнопка на всех страницах; модалка с контактами + формой; `mailto:` по умолчанию; опц. webhook POST-endpoint; доступность.
- **Non-Goals:** серверная обработка сообщений; хранение сообщений; аутентификация; капча (в рамках данного change).

## Approach
1. **Разметка модалки — инлайн** в каждую из 5 страниц (единый сниппет: фиксированная кнопка-триггер в углу + диалог `role="dialog" aria-modal="true"`). Отдельного `web/contact-modal.html` НЕ создаём, чтобы не появлялся нестраничный HTML в `web/` (его могут отфлагать page/link-тесты).
2. Создать `web/contact-modal.css` — минимальные стили (position fixed, overlay, focus-trap, mobile-first), без Tailwind-зависимости (работают даже если Tailwind CDN не загрузился).
3. Создать `web/contact-modal.js` — логика:
   - открытие/закрытие (клик триггер, ESC, клик по overlay); background scroll-lock + `aria-hidden`/`inert` на контент страницы пока открыто; focus возвращается к триггеру.
   - `data-contact-email` (по умолчанию `saleksey67@gmail.com`), `data-contact-endpoint` (опц., **только `https://`**, без credentials в URL).
   - **Отправка по умолчанию (endpoint не задан):** `window.location.href = 'mailto:'+email+'?subject=...&body=...'` (нативный, офлайн, без сетевых вызовов).
   - **Webhook-путь (endpoint задан):** `fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body: JSON.stringify({email: <from>, message: <text>, _subject: 'Связь с автором — AI Disrupt PDLC'}), credentials:'omit'})`. Formspree требует `Accept: application/json`, иначе вернёт HTML-редирект вместо `{ok:true}`. При ответе `ok:true` → подтверждение в UI. При сетевой ошибке / non-2xx → **fallback на `mailto:`** (или видимая ошибка + кнопка «открыть почту»).
   - базовая валидация: непустое сообщение.
4. Подключить на всех 5 страницах перед `</body>`:
   ```html
   <link rel="stylesheet" href="contact-modal.css">
   <script src="contact-modal.js" defer></script>
   ```

## File Manifest (добавляемые)
- `web/contact-modal.css`
- `web/contact-modal.js`
(разметка модалки — инлайн в 5 страниц, отдельного HTML-файла нет)

## Determinism / Safety
- Никаких секретов в репо. Endpoint (если используется) — публичный Formspree-подобный `https://` URL, задаётся через `data-` атрибут, не коммитится как секрет.
- `mailto:` нативный, не требует сети и работает офлайн.
- **Требует обновления `publish-policy.json` `allowed_web_files`** (добавить `web/contact-modal.css` и `web/contact-modal.js`), иначе artifact-валидатор заблокирует деплой.

## Rollout
- Через отдельный PR в защищённую ветку `master` (прямой push запрещён защитой).
- Проверка: локальный сервер + Chrome CDP smoke (модалка открывается/закрывается, `mailto:` формируется, webhook POST шлёт валидный JSON и корректно обрабатывает `ok:true` и ошибку).

## Open Questions
- Нет (endpoint https://formspree.io/f/xgawanjd уже проверен рабочим через curl POST → ok:true).
