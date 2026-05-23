import { describe, expect, it } from "vitest";

import type { BoardTask, TaskStatus } from "@/modules/board/model/board-types";
import {
  makeBoardTask,
  tasksInColumn,
} from "@/modules/tasks/lib/__fixtures__/board-tasks";
import { resolveDropTarget } from "@/modules/tasks/lib/dnd-utils";
import {
  moveTask,
  setActiveBoard,
  setAllBoardTasks,
  setBoardCatalog,
  tasksReducer,
} from "@/modules/tasks/model/tasks-slice";

const BOARD_ID = "board-1";

function columnOrderIds(tasks: BoardTask[], status: TaskStatus) {
  return tasks
    .filter((task) => task.status === status)
    .sort((a, b) => a.order - b.order)
    .map((task) => task.id);
}

function applyDnDDrop(
  tasks: BoardTask[],
  activeId: string,
  overId: string,
): BoardTask[] | null {
  const dropTarget = resolveDropTarget(overId, tasks, activeId);
  if (!dropTarget) {
    return null;
  }

  const activeTask = tasks.find((task) => task.id === activeId);
  if (!activeTask) {
    return null;
  }

  if (
    activeTask.status === dropTarget.status &&
    activeTask.order === dropTarget.order
  ) {
    return tasks;
  }

  let state = tasksReducer(undefined, setBoardCatalog([{ id: BOARD_ID, title: "Доска" }]));
  state = tasksReducer(state, setActiveBoard(BOARD_ID));
  state = tasksReducer(state, setAllBoardTasks({ [BOARD_ID]: tasks }));
  state = tasksReducer(
    state,
    moveTask({
      boardId: BOARD_ID,
      taskId: activeId,
      status: dropTarget.status,
      order: dropTarget.order,
    }),
  );

  return state.boards[BOARD_ID] ?? [];
}

describe("resolveDropTarget → moveTask contract", () => {
  const todoTasks = tasksInColumn(["a", "b", "c"], "todo");
  const doingTasks = [makeBoardTask({ id: "d", status: "doing", order: 0 })];
  const mixed: BoardTask[] = [...todoTasks, ...doingTasks];

  it.each([
    {
      name: "reorder within column (a onto b)",
      tasks: todoTasks,
      activeId: "a",
      overId: "b",
      expectColumns: { todo: ["b", "a", "c"] },
    },
    {
      name: "move to start (b onto a)",
      tasks: todoTasks,
      activeId: "b",
      overId: "a",
      expectColumns: { todo: ["b", "a", "c"] },
    },
    {
      name: "cross-column onto card",
      tasks: mixed,
      activeId: "a",
      overId: "d",
      expectColumns: { todo: ["b", "c"], doing: ["a", "d"] },
    },
    {
      name: "drop on empty column",
      tasks: mixed,
      activeId: "a",
      overId: "review",
      expectColumns: { todo: ["b", "c"], review: ["a"] },
    },
    {
      name: "drop on column when active not in target",
      tasks: mixed,
      activeId: "a",
      overId: "doing",
      expectColumns: { todo: ["b", "c"], doing: ["d", "a"] },
    },
    {
      name: "drop on column when active already in target",
      tasks: mixed,
      activeId: "d",
      overId: "doing",
      expectColumns: { todo: ["a", "b", "c"], doing: ["d"] },
    },
  ] as const)(
    "$name",
    ({ tasks, activeId, overId, expectColumns }) => {
      const result = applyDnDDrop(tasks, activeId, overId);
      expect(result).not.toBeNull();

      for (const [status, ids] of Object.entries(expectColumns) as [
        TaskStatus,
        string[],
      ][]) {
        expect(columnOrderIds(result!, status)).toEqual(ids);
      }
    },
  );

  it("matches arrayMove order for same-column card drops", () => {
    const tasks = tasksInColumn(["a", "b", "c", "d"], "todo");

    for (const [activeId, overId, expected] of [
      ["a", "c", ["b", "c", "a", "d"]],
      ["d", "b", ["a", "d", "b", "c"]],
      ["c", "a", ["c", "a", "b", "d"]],
    ] as const) {
      const result = applyDnDDrop(tasks, activeId, overId);
      expect(columnOrderIds(result!, "todo")).toEqual(expected);
    }
  });
});
