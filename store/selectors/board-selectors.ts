import { createSelector } from "@reduxjs/toolkit";

import { COLUMN_DEFINITIONS, type BoardColumn } from "@/lib/board-types";
import type { RootState } from "@/store/store";

const selectActiveBoardId = (state: RootState) => state.tasks.activeBoardId;

export const selectActiveBoardTasks = createSelector(
  [(state: RootState) => state.tasks.boards, selectActiveBoardId],
  (boards, boardId) => boards[boardId] ?? [],
);

export const selectBoardColumns = createSelector(
  [selectActiveBoardTasks],
  (tasks): BoardColumn[] =>
    COLUMN_DEFINITIONS.map((column) => ({
      ...column,
      tasks: tasks
        .filter((task) => task.status === column.id)
        .sort((a, b) => a.order - b.order),
    })),
);
