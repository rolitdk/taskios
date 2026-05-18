import type { BoardTask } from "@/lib/board-types";
import { initialTasks } from "@/lib/mock-board";

import {
  STATIC_BOARD_CATALOG,
  WORK_BOARD_ID,
} from "./board-catalog";

export function buildInitialBoards(): Record<string, BoardTask[]> {
  return {
    [WORK_BOARD_ID]: initialTasks,
    ...Object.fromEntries(
      STATIC_BOARD_CATALOG.map(({ meta, tasks }) => [meta.id, tasks]),
    ),
  };
}
