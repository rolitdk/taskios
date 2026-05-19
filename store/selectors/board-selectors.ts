import { createSelector } from "@reduxjs/toolkit";

import {
  COLUMN_DEFINITIONS,
  type BoardColumn,
  type BoardTask,
} from "@/lib/board-types";
import type { BoardCatalogMeta } from "@/lib/board-catalog";
import type { RootState } from "@/store/store";

function boardHref(boardId: string): string {
  return `/boards/${boardId}`;
}

const selectActiveBoardId = (state: RootState) => state.tasks.activeBoardId;
const selectBoards = (state: RootState) => state.tasks.boards;
const selectBoardMetas = (state: RootState) => state.tasks.boardMetas;

export const selectAllBoardMetas = createSelector(
  [selectBoardMetas],
  (metas): BoardCatalogMeta[] =>
    metas.map((meta) => ({
      ...meta,
      href: boardHref(meta.id),
    })),
);

export const selectBoardMetaById = createSelector(
  [selectAllBoardMetas, (_state: RootState, boardId: string) => boardId],
  (metas, boardId) => metas.find((meta) => meta.id === boardId),
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
