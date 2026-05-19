# Taskios

Taskios — это современное веб-приложение для управления задачами, вдохновлённое канбан-системами.  
Проект разработан на **Next.js** с поддержкой **Docker**, с фокусом на простоту, скорость и гибкость управления задачами.

---

## Возможности

- 📋 Создание досок (boards)
- 🗂 Управление списками и карточками задач
- 🔄 Drag & Drop (перетаскивание задач)
- 👤 Система пользователей (если реализована / планируется)
- 🏷 Метки и приоритеты задач
- 💬 Описание и комментарии к задачам
- 📱 Адаптивный интерфейс

---

## Технологии

- ⚛️ Next.js (App Router)
- 🟦 TypeScript
- 🎨 Tailwind CSS (или другой UI framework, если используешь)
- 🐳 Docker / Docker Compose
- 🗄 PostgreSQL / MongoDB (укажи свой вариант)
- 🔐 Auth (NextAuth / JWT — если есть)

-----------------------------------------------------------------------------------

## 📦 Установка проекта

### 1. Клонирование репозитория

```bash
git clone https://github.com/rolitdk/taskios.git
cd taskios
```

### 2. Локальный запуск через Docker Compose

```bash
docker compose up --build
```

После старта:
- приложение: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

### 3. Прод-режим через Docker Compose

Создай `.env` на основе `.env.example` и задай безопасные `JWT_*` секреты.

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

## Полезные команды

```bash
# Остановить локальные контейнеры
docker compose down

# Остановить локальные контейнеры и удалить volume БД
docker compose down -v
```
