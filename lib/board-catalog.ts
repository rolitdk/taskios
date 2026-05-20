import type { BoardTask } from "@/lib/board-types";
import { MOCK_BOARDS } from "@/lib/mock-boards";

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

export const BOARD_HIGHLIGHT_TASK_QUERY = "task";

function boardHref(boardId: string): string {
  return `/boards/${boardId}`;
}

export function boardHrefWithHighlightTask(
  boardId: string,
  taskId: string,
): string {
  return `${boardHref(boardId)}?${BOARD_HIGHLIGHT_TASK_QUERY}=${encodeURIComponent(taskId)}`;
}

export const ALL_BOARD_METAS: BoardCatalogMeta[] = MOCK_BOARDS.map((board) => ({
  id: board.id,
  title: board.title,
  href: boardHref(board.id),
}));

export function getBoardMeta(boardId: string): BoardCatalogMeta | undefined {
  return ALL_BOARD_METAS.find((board) => board.id === boardId);
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
    const haystack = [
      task.title,
      task.subtitle,
      ...task.tags.map((t) => t.label),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}
