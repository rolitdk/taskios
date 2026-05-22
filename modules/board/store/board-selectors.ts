import { createSelector } from "@reduxjs/toolkit";

import {
  COLUMN_DEFINITIONS,
  type BoardColumn,
  type BoardTask,
} from "@/modules/board/model/board-types";
import type { BoardCatalogItem } from "@/modules/board/model/board-catalog";
import type { RootState } from "@/store/store";

function boardHref(boardId: string): string {
  return `/boards/${boardId}`;
}

const selectActiveBoardId = (state: RootState) => state.tasks.activeBoardId;
const selectBoards = (state: RootState) => state.tasks.boards;
const selectBoardCatalog = (state: RootState) => state.tasks.boardCatalog;

export const selectBoardCatalogItems = createSelector(
  [selectBoardCatalog],
  (catalog): BoardCatalogItem[] =>
    catalog.map((entry) => ({
      ...entry,
      href: boardHref(entry.id),
    })),
);

export const selectBoardCatalogItemById = createSelector(
  [selectBoardCatalogItems, (_state: RootState, boardId: string) => boardId],
  (catalog, boardId) => catalog.find((entry) => entry.id === boardId),
);

function buildBoardColumns(tasks: BoardTask[]): BoardColumn[] {
  return COLUMN_DEFINITIONS.map((column) => ({
    ...column,
    tasks: tasks
      .filter((task) => task.status === column.id)
      .sort((a, b) => a.order - b.order),
  }));
}

export const selectBoardTasksById = createSelector(
  [selectBoards, (_state: RootState, boardId: string) => boardId],
  (boards, boardId) => boards[boardId] ?? [],
);

export const selectBoardColumnsForBoard = createSelector(
  [selectBoardTasksById],
  (tasks): BoardColumn[] => buildBoardColumns(tasks),
);

export const selectActiveBoardTasks = createSelector(
  [selectBoards, selectActiveBoardId],
  (boards, boardId) => boards[boardId] ?? [],
);

export const selectBoardColumns = createSelector(
  [selectActiveBoardTasks],
  (tasks): BoardColumn[] => buildBoardColumns(tasks),
);
