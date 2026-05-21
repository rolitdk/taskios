import type { BoardTask, TaskStatus } from "@/modules/board/model/board-types";

type MockTaskSeed = Omit<BoardTask, "status" | "order">;

function tasksFromSeeds(
  seedsByStatus: Record<TaskStatus, MockTaskSeed[]>,
): BoardTask[] {
  return (
    Object.entries(seedsByStatus) as [TaskStatus, MockTaskSeed[]][]
  ).flatMap(([status, tasks]) =>
    tasks.map((task, index) => ({
      ...task,
      status,
      order: index,
    })),
  );
}

export type MockBoardDefinition = {
  id: string;
  title: string;
  tasks: BoardTask[];
};

export const MOCK_BOARDS: MockBoardDefinition[] = [
  {
    id: "work",
    title: "Рабочие задачи",
    tasks: tasksFromSeeds({
      todo: [
        {
          id: "t1",
          title: "Собрать макет главной страницы",
          subtitle: "14 мая · без срока",
          initials: "ТК",
          avatarTone: "soft",
          tags: [{ label: "Дизайн", tone: "purple" }],
        },
        {
          id: "t2",
          title: "Описать API для досок",
          subtitle: "На следующей неделе",
          initials: "АП",
          avatarTone: "muted",
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
          avatarTone: "shell",
          tags: [],
        },
      ],
      doing: [
        {
          id: "t4",
          title: "Настроить цветовую схему Taskios",
          subtitle: "Сегодня",
          initials: "UI",
          avatarTone: "accent",
          tags: [{ label: "UI", tone: "purple" }],
        },
        {
          id: "t5",
          title: "Каркас колонок канбана",
          subtitle: "В процессе",
          initials: "КБ",
          avatarTone: "muted",
          tags: [{ label: "Фронт", tone: "mint" }],
        },
      ],
      review: [
        {
          id: "t6",
          title: "Черновик страницы входа",
          subtitle: "Ждёт ревью",
          initials: "РГ",
          avatarTone: "soft",
          tags: [{ label: "Работа", tone: "pink" }],
        },
      ],
      done: [
        {
          id: "t7",
          title: "Инициализация репозитория Next.js",
          subtitle: "Завершено",
          initials: "NX",
          avatarTone: "column",
          tags: [{ label: "Инфра", tone: "purple" }],
        },
        {
          id: "t8",
          title: "Базовый layout и шрифты",
          subtitle: "Завершено",
          initials: "LW",
          avatarTone: "shell",
          tags: [],
        },
      ],
    }),
  },
  {
    id: "home",
    title: "Домашние задачи",
    tasks: [
      {
        id: "h1",
        title: "Помыть посуду",
        subtitle: "Сегодня вечером",
        initials: "ПП",
        avatarTone: "soft",
        tags: [{ label: "Дом", tone: "pink" }],
        status: "todo",
        order: 0,
      },
      {
        id: "h2",
        title: "Вынести мусор",
        subtitle: "До 20:00",
        initials: "ВМ",
        avatarTone: "muted",
        tags: [],
        status: "todo",
        order: 1,
      },
      {
        id: "h3",
        title: "Пропылесосить гостиную",
        subtitle: "В выходные",
        initials: "ПГ",
        avatarTone: "shell",
        tags: [{ label: "Уборка", tone: "mint" }],
        status: "doing",
        order: 0,
      },
    ],
  },
  {
    id: "sport",
    title: "Спортивные задачи",
    tasks: [
      {
        id: "s1",
        title: "Пробежка 5 км",
        subtitle: "Утром",
        initials: "П5",
        avatarTone: "accent",
        tags: [{ label: "Бег", tone: "mint" }],
        status: "todo",
        order: 0,
      },
      {
        id: "s2",
        title: "Растяжка после тренировки",
        subtitle: "15 минут",
        initials: "РТ",
        avatarTone: "soft",
        tags: [],
        status: "done",
        order: 0,
      },
    ],
  },
];

export function buildInitialBoards(): Record<string, BoardTask[]> {
  return Object.fromEntries(
    MOCK_BOARDS.map((board) => [board.id, board.tasks]),
  );
}

export function buildInitialBoardMetas(): { id: string; title: string }[] {
  return MOCK_BOARDS.map(({ id, title }) => ({ id, title }));
}

export function getMockBoard(boardId: string): MockBoardDefinition | undefined {
  return MOCK_BOARDS.find((board) => board.id === boardId);
}
