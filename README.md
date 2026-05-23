# Taskios

**Taskios** — веб-приложение для управления задачами в стиле Trello: канбан-доски с колонками статусов, карточками и drag & drop. Интерфейс на русском языке, с фокусом на простоту и спокойную визуальную палитру.

В репозитории — полноценный fullstack: **Next.js 16** (фронт и API), **PostgreSQL** + **Prisma 7**, JWT-авторизация. Доски и задачи подгружаются из БД после входа; канбан синхронизируется с API через **оптимистичный Redux** (см. раздел «Синхронизация данных»).

---

## Возможности

### Канбан

- Несколько досок (в БД — проекты `Project`, в UI — «доски»)
- Колонки: **К выполнению** → **В работе** → **На проверке** → **Готово**
- Карточки: заголовок, описание, теги (в UI), аватар-инициалы, порядок в колонке
- **Drag & drop** между колонками и внутри колонки (`@dnd-kit`)
- Создание, переименование и удаление досок — с сохранением в БД
- Очистка колонки — удаление задач этой колонки в БД
- Глобальный поиск задач по всем доскам (по данным в Redux)
- Подсветка карточки по ссылке из поиска (`?task=<id>`)

### Авторизация и API

- Регистрация и вход по email и паролю
- JWT в httpOnly-cookie (access + refresh), `proxy.ts` защищает страницы и `/api/*`
- REST API: пользователи, доски (`/api/boards`), задачи, комментарии; полный CRM-проект — `/api/projects`
- PostgreSQL 16 + Prisma 7

---

## Синхронизация данных

| Действие                                                 | Где хранится                                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Вход, сессия                                             | Cookie + БД (`User`)                                                                 |
| Список досок, создание / переименование / удаление доски | PostgreSQL (`Project`)                                                               |
| Загрузка задач при открытии приложения                   | PostgreSQL → Redux (`sortOrder` → поле `order` на карточке)                          |
| Очистка колонки                                          | PostgreSQL + Redux                                                                   |
| Создание / удаление карточки, DnD                        | **Redux сразу** + `POST` / `DELETE` / `PATCH` задачи; при ошибке API — откат в store |
| Редактирование карточки (форма)                          | Сначала API (`PATCH`), затем обновление Redux ответом сервера                        |
| Теги на карточке                                         | PostgreSQL (`Task.tags`, JSON) + Redux                                               |

Порядок в колонке на доске и в БД — поле **`sortOrder`** (в Redux на карточке — `order`). Хуки: `use-create-task`, `use-delete-task`, `use-move-task` (оптимистично), `use-edit-task` (после успешного ответа API).

При перезагрузке страницы состояние доски совпадает с БД: расхождение возможно только до завершения запроса или при сбое сети (после отката UI снова согласован с последним успешным ответом API).

---

## Стек

| Слой          | Технологии                                                 |
| ------------- | ---------------------------------------------------------- |
| Frontend      | Next.js 16 (App Router), React 19, TypeScript              |
| Состояние UI  | Redux Toolkit, react-redux                                 |
| DnD           | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| Стили         | Tailwind CSS v4                                            |
| Формы         | react-hook-form, Zod                                       |
| Backend       | Route Handlers, `jose` (JWT), `bcryptjs`                   |
| БД            | PostgreSQL 16, Prisma 7 (`@prisma/adapter-pg`)             |
| Качество кода | ESLint, Prettier, Husky + lint-staged (pre-commit), Vitest |

Импорты через алиас `@/` → корень проекта.

---

## Структура проекта

```
app/
  (pages)/              # /, /login, /register, /boards, /boards/[boardId]
  api/                  # auth, boards, tasks, projects, comments
  layout.tsx, globals.css
components/ui/          # AppShell, лендинг, общие поля форм
modules/
  board/                # UI доски, API-клиент досок, типы колонок, селекторы
  tasks/                # карточки, формы, DnD, tasks-slice, API задач
  user/                 # формы входа/регистрации, AuthProvider, маршруты auth
shared/
  server/               # Prisma, JWT, валидация, HTTP-ответы, сессия
  lib/                  # общий api-client
store/                  # configureStore, StoreProvider, typed hooks
prisma/                 # schema, migrations
proxy.ts                # проверка JWT, редиректы, защита API
```

### Домен канбана

Колонки: `todo` | `doing` | `review` | `done` (`TaskStatus` в Prisma и в `modules/board/model/board-types.ts`).

Изменения порядка и статуса на доске — через actions в `modules/tasks/model/tasks-slice.ts`; не дублируйте эту логику в компонентах.

Доска в UI = запись `Project` с участником `ProjectMember` для текущего пользователя.

---

## Быстрый старт (Docker)

```bash
git clone https://github.com/rolitdk/taskios.git
cd taskios
docker compose up --build
```

После старта:

- приложение: [http://localhost:3000](http://localhost:3000)
- PostgreSQL: `localhost:5432` (БД `taskios`, пользователь/пароль `postgres` / `postgres`)

Контейнер `app` выполняет `prisma generate`, `prisma migrate deploy` и `npm run dev`.

Остановка:

```bash
docker compose down          # остановить контейнеры
docker compose down -v       # остановить и удалить volume БД
```

---

## Локальная разработка без Docker

**Требования:** Node.js 22+, PostgreSQL 16+.

1. Установить зависимости:

```bash
npm ci
```

2. Создать `.env` в корне:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskios?schema=public"
JWT_ACCESS_SECRET="замените_на_длинный_случайный_секрет"
JWT_REFRESH_SECRET="замените_на_другой_длинный_секрет"
```

3. Применить миграции и сгенерировать клиент:

```bash
npx prisma migrate deploy
npx prisma generate
```

4. Запустить dev-сервер:

```bash
npm run dev
```

Приложение: [http://localhost:3000](http://localhost:3000).

---

## Продакшен (Docker Compose)

Создайте `.env` рядом с `docker-compose.prod.yml` (минимум секреты JWT; при необходимости переопределите `POSTGRES_*`):

```env
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
# опционально:
# POSTGRES_DB=taskios
# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=...
```

Запуск:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Сборка: образ `prod` (`Dockerfile`) — `next build`, миграции при старте, `next start` на порту 3000.

---

## Переменные окружения

| Переменная           | Назначение                               |
| -------------------- | ---------------------------------------- |
| `DATABASE_URL`       | Строка подключения PostgreSQL для Prisma |
| `JWT_ACCESS_SECRET`  | Секрет access-токена (≈15 мин)           |
| `JWT_REFRESH_SECRET` | Секрет refresh-токена (≈7 дней)          |
| `NODE_ENV`           | `development` / `production`             |

В `docker-compose.yml` для разработки заданы dev-секреты — **не используйте их в продакшене**.

---

## Скрипты npm

| Команда                     | Описание                         |
| --------------------------- | -------------------------------- |
| `npm run dev`               | Dev-сервер Next.js               |
| `npm run build`             | Production-сборка                |
| `npm run start`             | Запуск собранного приложения     |
| `npm run lint`              | ESLint                           |
| `npm test`                  | Unit-тесты (Vitest, один прогон) |
| `npm run test:watch`        | Vitest в режиме watch            |
| `npx prisma migrate deploy` | Применить миграции               |
| `npx prisma generate`       | Сгенерировать Prisma Client      |
| `npx prisma studio`         | GUI для просмотра данных в БД    |

### Тесты

Стек: **Vitest** + **jsdom** (конфиг — `vitest.config.ts`). Файлы: `**/*.{test,spec}.{ts,tsx}` рядом с кодом в `modules/` и `shared/`.

```bash
npm test              # CI / перед коммитом вручную
npm run test:watch    # при разработке
```

После `npm ci` срабатывает `prepare` → **Husky**. Pre-commit через **lint-staged**: ESLint и Prettier по staged-файлам, затем `vitest related --run` для затронутых `*.ts` / `*.tsx`. Отключить локально: `git commit --no-verify` (только если осознанно).

---

## Маршруты приложения

| Путь                  | Доступ      | Описание           |
| --------------------- | ----------- | ------------------ |
| `/`                   | Публичный   | Лендинг            |
| `/login`, `/register` | Публичный   | Вход и регистрация |
| `/boards`             | После входа | Список досок       |
| `/boards/[boardId]`   | После входа | Канбан-доска       |

Без сессии защищённые страницы перенаправляются на `/login?from=...`. Авторизованный пользователь на `/login` или `/register` попадает на `/boards`.

---

## REST API (кратко)

Все маршруты, кроме перечисленных ниже, требуют валидный access-cookie (или успешный refresh в `proxy`).

**Публичные:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`

**С сессией:**

- `GET /api/auth/me` — текущий пользователь
- `GET|POST /api/boards`, `GET|PATCH|DELETE /api/boards/[id]` — доски канбана
- `DELETE /api/boards/[id]/tasks?status=<todo|doing|review|done>` — очистить колонку
- `GET|POST /api/tasks`, `GET|PATCH|DELETE /api/tasks/[id]` — задачи (`projectId` в теле/query = id доски)
- `GET|POST /api/projects`, `GET|PATCH|DELETE /api/projects/[id]` — проекты CRM (статус, бюджет, дедлайн)
- `GET|POST /api/tasks/[id]/comments`, `PATCH|DELETE /api/comments/[id]`

Модель в БД: **User**, **Project** (+ **ProjectMember**), **Task** (статус канбана, приоритет, срок), **Comment**.

---

## Лицензия

Проект в разработке; уточните лицензию у владельца репозитория при публикации.
