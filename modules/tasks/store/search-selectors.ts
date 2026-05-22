import { createSelector } from "@reduxjs/toolkit";

import { toSearchableEntries } from "@/modules/board/model/board-catalog";
import type { RootState } from "@/store/store";

import { selectBoardCatalogItems } from "@/modules/board/store/board-selectors";

export const selectAllSearchableTasks = createSelector(
  [(state: RootState) => state.tasks.boards, selectBoardCatalogItems],
  (boards, catalog) =>
    catalog.flatMap((item) =>
      toSearchableEntries(boards[item.id] ?? [], item),
    ),
);
