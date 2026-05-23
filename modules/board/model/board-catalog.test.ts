import { describe, expect, it } from "vitest";

import {
  BOARD_HIGHLIGHT_TASK_QUERY,
  boardHrefWithHighlightTask,
  filterSearchableTasks,
  toSearchableEntries,
  type BoardCatalogItem,
  type SearchableTaskEntry,
} from "@/modules/board/model/board-catalog";
import type { BoardTask } from "@/modules/board/model/board-types";
import { makeBoardTask } from "@/modules/tasks/lib/__fixtures__/board-tasks";

const catalogItem: BoardCatalogItem = {
  id: "board-1",
  title: "Проект Alpha",
  href: "/boards/board-1",
};

function makeEntry(
  overrides: Partial<BoardTask> & Pick<BoardTask, "id">,
): SearchableTaskEntry {
  return {
    task: makeBoardTask({
      title: "Задача",
      subtitle: "Описание",
      tags: [],
      status: "todo",
      order: 0,
      ...overrides,
    }),
    boardId: catalogItem.id,
    boardTitle: catalogItem.title,
    boardHref: catalogItem.href,
  };
}

describe("boardHrefWithHighlightTask", () => {
  it("appends encoded task query param", () => {
    expect(boardHrefWithHighlightTask("board-1", "task/1")).toBe(
      `/boards/board-1?${BOARD_HIGHLIGHT_TASK_QUERY}=${encodeURIComponent("task/1")}`,
    );
  });
});

describe("toSearchableEntries", () => {
  it("attaches catalog metadata to each task", () => {
    const tasks = [
      makeBoardTask({ id: "t1", status: "todo", order: 0, title: "One" }),
      makeBoardTask({ id: "t2", status: "done", order: 0, title: "Two" }),
    ];

    expect(toSearchableEntries(tasks, catalogItem)).toEqual([
      {
        task: tasks[0],
        boardId: "board-1",
        boardTitle: "Проект Alpha",
        boardHref: "/boards/board-1",
      },
      {
        task: tasks[1],
        boardId: "board-1",
        boardTitle: "Проект Alpha",
        boardHref: "/boards/board-1",
      },
    ]);
  });
});

describe("filterSearchableTasks", () => {
  const entries: SearchableTaskEntry[] = [
    makeEntry({
      id: "t1",
      title: "Деплой API",
      subtitle: "Настроить CI",
      tags: [{ label: "backend", tone: "blue" }],
    }),
    makeEntry({
      id: "t2",
      title: "Макет",
      subtitle: "Figma review",
      tags: [{ label: "design", tone: "pink" }],
    }),
  ];

  it("returns empty array for blank query", () => {
    expect(filterSearchableTasks(entries, "")).toEqual([]);
    expect(filterSearchableTasks(entries, "   ")).toEqual([]);
  });

  it("matches title case-insensitively", () => {
    expect(filterSearchableTasks(entries, "деплой").map((e) => e.task.id)).toEqual([
      "t1",
    ]);
  });

  it("matches subtitle", () => {
    expect(filterSearchableTasks(entries, "figma").map((e) => e.task.id)).toEqual([
      "t2",
    ]);
  });

  it("matches tag labels", () => {
    expect(filterSearchableTasks(entries, "BACKEND").map((e) => e.task.id)).toEqual([
      "t1",
    ]);
  });

  it("returns no matches when query is absent from haystack", () => {
    expect(filterSearchableTasks(entries, "mobile")).toEqual([]);
  });
});
