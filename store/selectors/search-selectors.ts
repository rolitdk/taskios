import { createSelector } from "@reduxjs/toolkit";

import { ALL_BOARD_METAS, toSearchableEntries } from "@/lib/board-catalog";
import type { RootState } from "@/store/store";

export const selectAllSearchableTasks = createSelector(
  [(state: RootState) => state.tasks.boards],
  (boards) =>
    ALL_BOARD_METAS.flatMap((meta) =>
      toSearchableEntries(boards[meta.id] ?? [], meta),
    ),
);
