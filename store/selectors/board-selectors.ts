import { createSelector } from "@reduxjs/toolkit";

import {
  COLUMN_DEFINITIONS,
  type BoardColumn,
  type BoardTask,
} from "@/lib/board-types";
import type { RootState } from "@/store/store";

const selectActiveBoardId = (state: RootState) => state.tasks.activeBoardId;
const selectBoards = (state: RootState) => state.tasks.boards;

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
