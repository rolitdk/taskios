import { createSelector } from "@reduxjs/toolkit";

import { COLUMN_DEFINITIONS, type BoardColumn } from "@/lib/board-types";
import type { RootState } from "@/store/store";

const selectTasks = (state: RootState) => state.tasks.tasks;

export const selectBoardColumns = createSelector(
  [selectTasks],
  (tasks): BoardColumn[] =>
    COLUMN_DEFINITIONS.map((column) => ({
      ...column,
      tasks: tasks
        .filter((task) => task.status === column.id)
        .sort((a, b) => a.order - b.order),
    })),
);
