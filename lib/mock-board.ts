// Мокирование данных для доски задач
import type { BoardTask, TaskStatus } from "@/lib/board-types";

type MockTaskSeed = Omit<BoardTask, "status" | "order">;

const seedsByStatus: Record<TaskStatus, MockTaskSeed[]> = {
  todo: [
    {
      id: "t1",
      title: "Собрать макет главной страницы",
      subtitle: "14 мая · без срока",
      initials: "ТК",
      avatarClass: "bg-accent-soft text-accent-strong",
      tags: [{ label: "Дизайн", tone: "purple" }],
    },
    {
      id: "t2",
      title: "Описать API для досок",
      subtitle: "На следующей неделе",
      initials: "АП",
      avatarClass: "bg-surface-muted text-accent-strong",
      tags: [
        { label: "Работа", tone: "pink" },
        { label: "Бэкенд", tone: "mint" },
      ],
    },
    {
      id: "t3",
      title: "Подобрать иконки для тегов",
      subtitle: "Низкий приоритет",
      initials: "ИК",
      avatarClass: "bg-shell-bg text-foreground",
      tags: [],
    },
  ],
  doing: [
    {
      id: "t4",
      title: "Настроить цветовую схему Taskios",
      subtitle: "Сегодня",
      initials: "UI",
      avatarClass: "bg-accent text-white",
      tags: [{ label: "UI", tone: "purple" }],
    },
    {
      id: "t5",
      title: "Каркас колонок канбана",
      subtitle: "В процессе",
      initials: "КБ",
      avatarClass: "bg-surface-muted text-accent-strong",
      tags: [{ label: "Фронт", tone: "mint" }],
    },
  ],
  review: [
    {
      id: "t6",
      title: "Черновик страницы входа",
      subtitle: "Ждёт ревью",
      initials: "РГ",
      avatarClass: "bg-accent-soft text-accent-strong",
      tags: [{ label: "Работа", tone: "pink" }],
    },
  ],
  done: [
    {
      id: "t7",
      title: "Инициализация репозитория Next.js",
      subtitle: "Завершено",
      initials: "NX",
      avatarClass: "bg-column-bg text-muted",
      tags: [{ label: "Инфра", tone: "purple" }],
    },
    {
      id: "t8",
      title: "Базовый layout и шрифты",
      subtitle: "Завершено",
      initials: "LW",
      avatarClass: "bg-shell-bg text-foreground",
      tags: [],
    },
  ],
};

export const initialTasks: BoardTask[] = (
  Object.entries(seedsByStatus) as [TaskStatus, MockTaskSeed[]][]
).flatMap(([status, tasks]) =>
  tasks.map((task, index) => ({
    ...task,
    status,
    order: index,
  })),
);
