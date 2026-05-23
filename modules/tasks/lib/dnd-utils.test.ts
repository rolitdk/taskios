import { describe, expect, it } from "vitest";

import type { BoardTask } from "@/modules/board/model/board-types";
import { isColumnId, resolveDropTarget } from "@/modules/tasks/lib/dnd-utils";
import {
  makeBoardTask,
  tasksInColumn,
} from "@/modules/tasks/lib/__fixtures__/board-tasks";

describe("isColumnId", () => {
  it.each([
    ["todo", true],
    ["doing", true],
    ["review", true],
    ["done", true],
    ["unknown", false],
    ["t-1", false],
    ["", false],
  ] as const)("returns %s → %s", (id, expected) => {
    expect(isColumnId(id)).toBe(expected);
  });
});

describe("resolveDropTarget", () => {
  const todoTasks = tasksInColumn(["a", "b", "c"], "todo");
  const doingTasks = [makeBoardTask({ id: "d", status: "doing", order: 0 })];
  const mixed: BoardTask[] = [...todoTasks, ...doingTasks];

  describe("drop on column", () => {
    it("places at end of empty column", () => {
      expect(resolveDropTarget("review", mixed, "a")).toEqual({
        status: "review",
        order: 0,
      });
    });

    it("places at end when active is not in target column", () => {
      expect(resolveDropTarget("doing", mixed, "a")).toEqual({
        status: "doing",
        order: 1,
      });
    });

    it("keeps at last index when active is already in target column", () => {
      expect(resolveDropTarget("doing", mixed, "d")).toEqual({
        status: "doing",
        order: 0,
      });
    });

    it("uses last slot when reordering within a multi-item column via column drop", () => {
      const tasks = tasksInColumn(["a", "b"], "todo");
      expect(resolveDropTarget("todo", tasks, "a")).toEqual({
        status: "todo",
        order: 1,
      });
    });
  });

  describe("drop on card", () => {
    it("reorders within the same column", () => {
      expect(resolveDropTarget("b", todoTasks, "a")).toEqual({
        status: "todo",
        order: 1,
      });
      expect(resolveDropTarget("a", todoTasks, "c")).toEqual({
        status: "todo",
        order: 0,
      });
    });

    it("moves to start when dropped on first card", () => {
      expect(resolveDropTarget("a", todoTasks, "b")).toEqual({
        status: "todo",
        order: 0,
      });
    });

    it("falls back to over task order when active is not in target column", () => {
      expect(resolveDropTarget("d", mixed, "a")).toEqual({
        status: "doing",
        order: 0,
      });
    });

    it("falls back when over id is missing from column index list", () => {
      const orphan = makeBoardTask({
        id: "ghost",
        status: "todo",
        order: 99,
      });
      expect(resolveDropTarget("ghost", [orphan], "a")).toEqual({
        status: "todo",
        order: 99,
      });
    });
  });

  it("returns null for unknown over id", () => {
    expect(resolveDropTarget("missing", mixed, "a")).toBeNull();
  });
});
