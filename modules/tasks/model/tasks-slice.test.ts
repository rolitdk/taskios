import { describe, expect, it } from "vitest";

import type { BoardTask } from "@/modules/board/model/board-types";
import { makeBoardTask } from "@/modules/tasks/lib/__fixtures__/board-tasks";
import {
  addBoard,
  addTask,
  moveTask,
  removeTask,
  setActiveBoard,
  setAllBoardTasks,
  setBoardCatalog,
  tasksReducer,
} from "@/modules/tasks/model/tasks-slice";

const BOARD_ID = "board-1";
const CATALOG = [{ id: BOARD_ID, title: "Доска" }];

function columnOrderIds(tasks: BoardTask[], status: BoardTask["status"]) {
  return tasks
    .filter((task) => task.status === status)
    .sort((a, b) => a.order - b.order)
    .map((task) => task.id);
}

function seedBoard(tasks: BoardTask[]) {
  let state = tasksReducer(undefined, setBoardCatalog(CATALOG));
  state = tasksReducer(state, setActiveBoard(BOARD_ID));
  return tasksReducer(state, setAllBoardTasks({ [BOARD_ID]: tasks }));
}

describe("tasksReducer", () => {
  describe("setBoardCatalog", () => {
    it("keeps existing tasks for boards still in catalog", () => {
      const tasks = [makeBoardTask({ id: "t1", status: "todo", order: 0 })];
      let state = seedBoard(tasks);
      state = tasksReducer(
        state,
        setBoardCatalog([
          { id: BOARD_ID, title: "Renamed" },
          { id: "board-2", title: "Вторая" },
        ]),
      );

      expect(state.boardCatalog).toHaveLength(2);
      expect(state.boards[BOARD_ID]).toEqual(tasks);
      expect(state.boards["board-2"]).toEqual([]);
    });

    it("resets active board when it is removed from catalog", () => {
      let state = seedBoard([]);
      state = tasksReducer(
        state,
        setBoardCatalog([{ id: "board-2", title: "Единственная" }]),
      );

      expect(state.activeBoardId).toBe("board-2");
    });
  });

  describe("moveTask", () => {
    it("reorders within a column", () => {
      const initial = [
        makeBoardTask({ id: "a", status: "todo", order: 0 }),
        makeBoardTask({ id: "b", status: "todo", order: 1 }),
        makeBoardTask({ id: "c", status: "todo", order: 2 }),
      ];
      const state = tasksReducer(
        seedBoard(initial),
        moveTask({
          boardId: BOARD_ID,
          taskId: "a",
          status: "todo",
          order: 2,
        }),
      );

      expect(columnOrderIds(state.boards[BOARD_ID]!, "todo")).toEqual([
        "b",
        "c",
        "a",
      ]);
      expect(
        state.boards[BOARD_ID]!.find((task) => task.id === "a")?.order,
      ).toBe(2);
    });

    it("moves task to another column and reindexes both columns", () => {
      const initial = [
        makeBoardTask({ id: "a", status: "todo", order: 0 }),
        makeBoardTask({ id: "b", status: "todo", order: 1 }),
        makeBoardTask({ id: "c", status: "doing", order: 0 }),
      ];
      const state = tasksReducer(
        seedBoard(initial),
        moveTask({
          boardId: BOARD_ID,
          taskId: "a",
          status: "doing",
          order: 1,
        }),
      );

      expect(columnOrderIds(state.boards[BOARD_ID]!, "todo")).toEqual(["b"]);
      expect(columnOrderIds(state.boards[BOARD_ID]!, "doing")).toEqual([
        "c",
        "a",
      ]);
    });

    it("ignores move for unknown board id", () => {
      const initial = [makeBoardTask({ id: "a", status: "todo", order: 0 })];
      const before = seedBoard(initial);
      const after = tasksReducer(
        before,
        moveTask({
          boardId: "missing",
          taskId: "a",
          status: "done",
          order: 0,
        }),
      );

      expect(after).toBe(before);
    });
  });

  describe("addTask", () => {
    it("appends to column with sequential order indices", () => {
      const state = tasksReducer(
        seedBoard([makeBoardTask({ id: "a", status: "todo", order: 0 })]),
        addTask({
          id: "new",
          title: "  Новая  ",
          subtitle: "",
          status: "todo",
          tags: [],
        }),
      );

      const tasks = state.boards[BOARD_ID]!;
      expect(tasks).toHaveLength(2);
      expect(columnOrderIds(tasks, "todo")).toEqual(["a", "new"]);
      const added = tasks.find((task) => task.id === "new");
      expect(added?.title).toBe("Новая");
      expect(added?.subtitle).toBe("Без описания");
      expect(added?.order).toBe(1);
    });

    it("inserts at explicit order", () => {
      const state = tasksReducer(
        seedBoard([
          makeBoardTask({ id: "a", status: "todo", order: 0 }),
          makeBoardTask({ id: "b", status: "todo", order: 1 }),
        ]),
        addTask({
          id: "mid",
          title: "Середина",
          subtitle: "Текст",
          status: "todo",
          order: 1,
          tags: [],
        }),
      );

      expect(columnOrderIds(state.boards[BOARD_ID]!, "todo")).toEqual([
        "a",
        "mid",
        "b",
      ]);
    });
  });

  describe("removeTask", () => {
    it("removes task and compacts order in the column", () => {
      const state = tasksReducer(
        seedBoard([
          makeBoardTask({ id: "a", status: "todo", order: 0 }),
          makeBoardTask({ id: "b", status: "todo", order: 1 }),
          makeBoardTask({ id: "c", status: "todo", order: 2 }),
        ]),
        removeTask({ boardId: BOARD_ID, taskId: "b" }),
      );

      const tasks = state.boards[BOARD_ID]!;
      expect(tasks).toHaveLength(2);
      expect(columnOrderIds(tasks, "todo")).toEqual(["a", "c"]);
      expect(tasks.every((task) => task.order < 2)).toBe(true);
    });

    it("does not change state when task is missing", () => {
      const before = seedBoard([]);
      const after = tasksReducer(
        before,
        removeTask({ boardId: BOARD_ID, taskId: "ghost" }),
      );
      expect(after).toBe(before);
    });
  });

  describe("addBoard guard", () => {
    it("rejects titles shorter than two characters", () => {
      const state = tasksReducer(
        undefined,
        addBoard({ id: "short", title: "  a  " }),
      );
      expect(state.boardCatalog).toHaveLength(0);
    });
  });
});
