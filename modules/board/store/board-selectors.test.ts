import { describe, expect, it } from "vitest";

import {
  selectBoardColumnsForBoard,
  selectBoardTasksById,
} from "@/modules/board/store/board-selectors";
import { COLUMN_DEFINITIONS } from "@/modules/board/model/board-types";
import { makeBoardTask } from "@/modules/tasks/lib/__fixtures__/board-tasks";
import type { RootState } from "@/store/store";

const BOARD_ID = "board-1";

function makeState(tasks: ReturnType<typeof makeBoardTask>[]): RootState {
  return {
    tasks: {
      activeBoardId: BOARD_ID,
      boardCatalog: [{ id: BOARD_ID, title: "Доска" }],
      boards: { [BOARD_ID]: tasks },
    },
  };
}

describe("selectBoardTasksById", () => {
  it("returns tasks for an existing board", () => {
    const tasks = [makeBoardTask({ id: "t1", status: "todo", order: 0 })];
    expect(selectBoardTasksById(makeState(tasks), BOARD_ID)).toEqual(tasks);
  });

  it("returns empty array for unknown board", () => {
    expect(selectBoardTasksById(makeState([]), "missing")).toEqual([]);
  });
});

describe("selectBoardColumnsForBoard", () => {
  it("groups tasks by column in sortOrder", () => {
    const state = makeState([
      makeBoardTask({ id: "c", status: "todo", order: 2 }),
      makeBoardTask({ id: "a", status: "todo", order: 0 }),
      makeBoardTask({ id: "b", status: "doing", order: 0 }),
      makeBoardTask({ id: "d", status: "todo", order: 1 }),
    ]);

    const columns = selectBoardColumnsForBoard(state, BOARD_ID);

    expect(columns.map((column) => column.id)).toEqual(
      COLUMN_DEFINITIONS.map((column) => column.id),
    );
    expect(columns.find((column) => column.id === "todo")?.tasks.map((t) => t.id)).toEqual([
      "a",
      "d",
      "c",
    ]);
    expect(columns.find((column) => column.id === "doing")?.tasks.map((t) => t.id)).toEqual([
      "b",
    ]);
    expect(columns.find((column) => column.id === "review")?.tasks).toEqual([]);
    expect(columns.find((column) => column.id === "done")?.tasks).toEqual([]);
  });

  it("returns empty columns for a board with no tasks", () => {
    const columns = selectBoardColumnsForBoard(makeState([]), BOARD_ID);

    expect(columns).toHaveLength(COLUMN_DEFINITIONS.length);
    expect(columns.every((column) => column.tasks.length === 0)).toBe(true);
  });
});
