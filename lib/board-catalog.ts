import type { BoardTask } from "@/lib/board-types";

export const WORK_BOARD_ID = "work";

export type BoardCatalogMeta = {
  id: string;
  title: string;
  href: string;
};

export type SearchableTaskEntry = {
  task: BoardTask;
  boardId: string;
  boardTitle: string;
  boardHref: string;
};

export const WORK_BOARD_META: BoardCatalogMeta = {
  id: WORK_BOARD_ID,
  title: "Рабочие задачи",
  href: "/",
};

export const STATIC_BOARD_CATALOG: {
  meta: BoardCatalogMeta;
  tasks: BoardTask[];
}[] = [
  {
    meta: {
      id: "home",
      title: "Домашние задачи",
      href: "/boards/home",
    },
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
    meta: {
      id: "sport",
      title: "Спортивные задачи",
      href: "/boards/sport",
    },
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

export const ALL_BOARD_METAS: BoardCatalogMeta[] = [
  WORK_BOARD_META,
  ...STATIC_BOARD_CATALOG.map((entry) => entry.meta),
];

export function getBoardMeta(boardId: string): BoardCatalogMeta | undefined {
  if (boardId === WORK_BOARD_META.id) {
    return WORK_BOARD_META;
  }
  return STATIC_BOARD_CATALOG.find((entry) => entry.meta.id === boardId)?.meta;
}

export function toSearchableEntries(
  tasks: BoardTask[],
  meta: BoardCatalogMeta,
): SearchableTaskEntry[] {
  return tasks.map((task) => ({
    task,
    boardId: meta.id,
    boardTitle: meta.title,
    boardHref: meta.href,
  }));
}

export function filterSearchableTasks(
  entries: SearchableTaskEntry[],
  query: string,
): SearchableTaskEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return entries.filter(({ task }) => {
    const haystack = [task.title, task.subtitle, ...task.tags.map((t) => t.label)]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}
