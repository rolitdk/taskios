import { createSelector } from "@reduxjs/toolkit";

import { toSearchableEntries } from "@/lib/board-catalog";
import type { RootState } from "@/store/store";

import { selectAllBoardMetas } from "./board-selectors";

export const selectAllSearchableTasks = createSelector(
  [(state: RootState) => state.tasks.boards, selectAllBoardMetas],
  (boards, boardMetas) =>
    boardMetas.flatMap((meta) =>
      toSearchableEntries(boards[meta.id] ?? [], meta),
    ),
);
