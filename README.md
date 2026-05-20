# Taskios

**Taskios** — веб-приложение для управления задачами в стиле Trello: канбан-доски с колонками статусов, карточками и drag & drop. Интерфейс на русском языке, с фокусом на простоту и спокойную визуальную палитру.

Репозиторий также содержит серверную часть (PostgreSQL, Prisma, REST API) для пользователей, проектов, задач и комментариев — она уже работает для авторизации; канбан в браузере пока хранит доски в **Redux** с демо-данными и не синхронизируется с API.

---

## Возможности

### Интерфейс (канбан)

- Несколько досок под разные проекты или клиентов
- Колонки: **К выполнению** → **В работе** → **На проверке** → **Готово**
- Карточки с заголовком, подзаголовком, тегами и аватаром-инициалами
- **Drag & drop** между колонками и внутри колонки (`@dnd-kit`)
- Создание, редактирование и удаление досок и задач (состояние в Redux)
- Глобальный поиск задач по всем доскам
- Публичная главная (`/`) и страницы входа / регистрации

### Авторизация и API

- Регистрация и вход по email и паролю
- JWT в httpOnly-cookie (access + refresh), middleware защищает страницы и `/api/*`
- REST API: пользователи, проекты (доски CRM), задачи, комментарии
- PostgreSQL 16 + Prisma 7

---

## Стек

| Слой | Технологии |
|------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Состояние UI | Redux Toolkit, react-redux |
| DnD | `@dnd-kit/core`, `@dnd-kit/sortable` |
| Стили | Tailwind CSS v4 |
| Формы | react-hook-form, Zod |
| Backend | Route Handlers, `jose` (JWT), `bcryptjs` |
| БД | PostgreSQL, Prisma |
| Качество кода | ESLint, Prettier, Husky |

Импорты через алиас `@/` → корень проекта.

---

## Структура проекта

```
app/
  (pages)/          # Страницы: /, /login, /register, /boards, /boards/[boardId]
  api/              # REST: auth, projects, tasks, comments
components/
  taskios/          # UI досок, колонок, карточек, форм, поиска
  providers/        # Redux StoreProvider, AuthProvider
store/
  slices/           # tasks-slice — доски и задачи в памяти
  selectors/        # Селекторы доски и поиска
lib/
  board-types.ts    # Типы канбана и колонок
  dnd-utils.ts      # Логика drop-целей
  mock-boards.ts    # Начальные демо-доски
  server/           # Prisma, auth, валидация, HTTP-ответы
prisma/
  schema.prisma     # User, Project, Task, Comment
  migrations/
middleware.ts       # Проверка JWT, редиректы на /login
```

---

## Быстрый старт (Docker)

Самый простой способ поднять приложение и БД:

```bash
git clone https://github.com/rolitdk/taskios.git
cd taskios
docker compose up --build
```

После старта:

- приложение: [http://localhost:3000](http://localhost:3000)
- PostgreSQL: `localhost:5432` (БД `taskios`, пользователь/пароль `postgres` / `postgres`)

Контейнер `app` автоматически выполняет `prisma generate`, `prisma migrate deploy` и `npm run dev`.

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

2. Создать `.env` в корне проекта:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskios?schema=public"
JWT_ACCESS_SECRET="замените_на_длинный_случайный_секрет"
JWT_REFRESH_SECRET="замените_на_другой_длинный_секрет"
```

3. Применить миграции и сгенерировать клиент Prisma:

```bash
npx prisma migrate deploy
npx prisma generate
```

4. Запустить dev-сервер:

```bash
npm run dev
```

Приложение будет доступно на [http://localhost:3000](http://localhost:3000).

---

## Продакшен (Docker Compose)

Создайте `.env` рядом с `docker-compose.prod.yml` и задайте безопасные секреты (минимум — переменные ниже; при необходимости переопределите `POSTGRES_*`):

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

Сборка использует production-образ (`Dockerfile`, target `prod`): `next build`, миграции при старте, `next start` на порту 3000.

---

## Переменные окружения

| Переменная | Назначение |
|------------|------------|
| `DATABASE_URL` | Строка подключения PostgreSQL для Prisma |
| `JWT_ACCESS_SECRET` | Секрет access-токена (≈15 мин) |
| `JWT_REFRESH_SECRET` | Секрет refresh-токена (≈7 дней) |
| `NODE_ENV` | `development` / `production` |

В `docker-compose.yml` для разработки заданы dev-секреты — **не используйте их в продакшене**.

---

## Скрипты npm

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер Next.js |
| `npm run build` | Production-сборка |
| `npm run start` | Запуск собранного приложения |
| `npm run lint` | ESLint |
| `npx prisma migrate deploy` | Применить миграции |
| `npx prisma generate` | Сгенерировать Prisma Client |
| `npx prisma studio` | GUI для просмотра данных в БД |

---

## Маршруты приложения

| Путь | Доступ | Описание |
|------|--------|----------|
| `/` | Публичный | Лендинг |
| `/login`, `/register` | Публичный | Вход и регистрация |
| `/boards` | После входа | Список досок |
| `/boards/[boardId]` | После входа | Канбан-доска |

Защищённые страницы без сессии перенаправляются на `/login?from=...`.

---

## REST API (кратко)

Все маршруты, кроме перечисленных ниже, требуют валидный access-cookie.

**Публичные:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`

**С сессией:**

- `GET /api/auth/me` — текущий пользователь
- `GET|POST /api/projects`, `GET|PATCH|DELETE /api/projects/[id]`
- `GET|POST /api/tasks`, `GET|PATCH|DELETE /api/tasks/[id]`
- `GET|POST /api/tasks/[id]/comments`, `PATCH|DELETE /api/comments/[id]`

Модель в БД: **Project** (статус, бюджет, дедлайн, участники), **Task** (статус канбана, приоритет, срок), **Comment**.

---

## Домен канбана (UI)

Колонки соответствуют enum `TaskStatus`: `todo` | `doing` | `review` | `done`.

Изменения позиций и статусов на доске идут через actions в `store/slices/tasks-slice.ts` — не дублируйте эту логику в компонентах.

Демо-доски и задачи задаются в `lib/mock-boards.ts`; при добавлении новых досок через UI они живут только в памяти сессии браузера до перезагрузки страницы.

---

## Лицензия

Проект в разработке; уточните лицензию у владельца репозитория при публикации.
