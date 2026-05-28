# Taskios

**Taskios** — fullstack веб‑приложение для управления задачами в стиле Trello: канбан‑доски, карточки, **drag & drop**, авторизация и синхронизация с сервером. Интерфейс — **на русском**.

Проект построен как приложение на **Next.js (App Router)**: UI + Route Handlers API в одном репозитории. Данные хранятся в **PostgreSQL**, доступ через **Prisma**. Авторизация — JWT в **httpOnly cookies** (access + refresh), а `proxy.ts` защищает страницы и API.

---

## Возможности

- **Канбан‑доска**: колонки `todo → doing → review → done`
- **Карточки задач**: заголовок, описание, приоритет, срок, теги, порядок в колонке
- **Drag & drop** внутри колонки и между колонками (`@dnd-kit`)
- **Доски пользователя**: создание / переименование / удаление
- **Очистка колонки**: массовое удаление задач по статусу
- **Глобальный поиск** по задачам (по данным в клиентском состоянии)
- **Ссылка на задачу**: подсветка карточки по `?task=<id>`
- **Комментарии** к задачам
- **Регистрация / вход / выход**, авто‑refresh токена

---

## Стек

- **Frontend**: Next.js 16, React 19, TypeScript
- **State**: Redux Toolkit + react-redux
- **DnD**: `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`
- **UI**: Tailwind CSS v4, react-hook-form, Zod
- **Backend**: Next Route Handlers, `jose` (JWT), `bcryptjs`
- **DB**: PostgreSQL 16, Prisma 7
- **Качество**: ESLint, Prettier, Husky + lint-staged, Vitest

Импорты через алиас `@/` → корень проекта.

---

## Как устроены данные и синхронизация

- **Источник истины**: PostgreSQL (таблицы `User`, `Project`, `ProjectMember`, `Task`, `Comment`)
- **Доска в UI**: запись `Project`, доступ пользователя — через `ProjectMember`
- **Порядок задач**: в БД поле `Task.sortOrder`, в UI отражается как `order`
- **DnD**: изменения применяются **оптимистично** в Redux и затем подтверждаются API; при ошибке — откат состояния

---

## Структура проекта

```
app/
  (pages)/                   # страницы: /, /login, /register, /boards, /boards/[boardId]
  api/                       # Route Handlers: auth, boards, tasks, projects, comments
  layout.tsx, globals.css

modules/
  board/                     # UI доски, модели, хуки, API клиент досок, селекторы
  tasks/                     # карточки, формы, DnD, tasks-slice, API задач, поиск
  user/                      # формы входа/регистрации, AuthProvider, маршруты auth

shared/
  lib/                       # общий api-client и утилиты
  server/                    # Prisma, JWT/cookies, контекст авторизации, ответы/валидация

store/                       # configureStore, StoreProvider, typed hooks
prisma/                      # schema.prisma и миграции
proxy.ts                     # защита страниц и /api/*, refresh токенов
```

---

## Быстрый старт (Docker, dev)

```bash
docker compose up --build
```

После старта:

- приложение: `http://localhost:3000`
- PostgreSQL: `localhost:5432` (БД `taskios`, пользователь/пароль `postgres` / `postgres`)

Контейнер `app` при старте выполняет `prisma generate`, `prisma migrate deploy` и запускает dev‑сервер.

Остановка:

```bash
docker compose down
docker compose down -v # удалить volume БД
```

---

## Локальная разработка без Docker

**Требования:** Node.js 22+, PostgreSQL 16+.

1. Установка зависимостей:

```bash
npm ci
```

2. `.env` в корне проекта:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskios?schema=public"
JWT_ACCESS_SECRET="замените_на_длинный_случайный_секрет"
JWT_REFRESH_SECRET="замените_на_другой_длинный_секрет"
```

3. Миграции и Prisma Client:

```bash
npx prisma migrate deploy
npx prisma generate
```

4. Запуск:

```bash
npm run dev
```

---

## Продакшен (Docker Compose)

Создайте `.env` рядом с `docker-compose.prod.yml` (минимум секреты JWT):

```env
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
```

Запуск:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

---

## Переменные окружения

- **`DATABASE_URL`**: строка подключения PostgreSQL для Prisma
- **`JWT_ACCESS_SECRET`**: секрет для access‑токена
- **`JWT_REFRESH_SECRET`**: секрет для refresh‑токена
- **`NODE_ENV`**: `development` / `production`

В `docker-compose.yml` для разработки заданы dev‑секреты — **не используйте их в продакшене**.

---

## Скрипты npm

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run test:watch
```

---

## Маршруты приложения

- **`/`** — лендинг (публично)
- **`/login`, `/register`** — вход и регистрация (публично)
- **`/boards`** — список досок (после входа)
- **`/boards/[boardId]`** — канбан‑доска (после входа)

Без сессии защищённые страницы перенаправляются на `/login?from=...`. Авторизованный пользователь на `/login`/`/register` перенаправляется на `/boards`.

---

## REST API (кратко)

Публичные:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

С авторизацией (access cookie или refresh через `proxy.ts`):

- `GET /api/auth/me`
- `GET|POST /api/boards`, `GET|PATCH|DELETE /api/boards/[id]`
- `DELETE /api/boards/[id]/tasks?status=<todo|doing|review|done>`
- `GET|POST /api/tasks`, `GET|PATCH|DELETE /api/tasks/[id]`
- `GET|POST /api/tasks/[id]/comments`, `PATCH|DELETE /api/comments/[id]`
- `GET|POST /api/projects`, `GET|PATCH|DELETE /api/projects/[id]`

---

## Лицензия

Проект в разработке; уточните лицензию у владельца репозитория при публикации.
