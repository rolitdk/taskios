import { createSelector } from "@reduxjs/toolkit";

import { toSearchableEntries } from "@/modules/board/model/board-catalog";
import type { RootState } from "@/store/store";

import { selectAllBoardMetas } from "@/modules/board/store/board-selectors";

export const selectAllSearchableTasks = createSelector(
  [(state: RootState) => state.tasks.boards, selectAllBoardMetas],
  (boards, boardMetas) =>
    boardMetas.flatMap((meta) =>
      toSearchableEntries(boards[meta.id] ?? [], meta),
    ),
);
