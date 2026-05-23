import { describe, expect, it } from "vitest";

import { selectAllSearchableTasks } from "@/modules/tasks/store/search-selectors";
import { makeBoardTask } from "@/modules/tasks/lib/__fixtures__/board-tasks";
import type { RootState } from "@/store/store";

function makeState(
  boards: RootState["tasks"]["boards"],
  catalog: RootState["tasks"]["boardCatalog"],
): RootState {
  return {
    tasks: {
      activeBoardId: catalog[0]?.id ?? null,
      boardCatalog: catalog,
      boards,
    },
  };
}

describe("selectAllSearchableTasks", () => {
  it("flattens tasks from all catalog boards with href metadata", () => {
    const state = makeState(
      {
        "board-a": [
          makeBoardTask({ id: "a1", status: "todo", order: 0, title: "A1" }),
        ],
        "board-b": [
          makeBoardTask({ id: "b1", status: "doing", order: 0, title: "B1" }),
          makeBoardTask({ id: "b2", status: "done", order: 0, title: "B2" }),
        ],
      },
      [
        { id: "board-a", title: "Alpha" },
        { id: "board-b", title: "Beta" },
      ],
    );

    const entries = selectAllSearchableTasks(state);

    expect(entries).toHaveLength(3);
    expect(entries[0]).toMatchObject({
      task: expect.objectContaining({ id: "a1" }),
      boardId: "board-a",
      boardTitle: "Alpha",
      boardHref: "/boards/board-a",
    });
    expect(entries[1]).toMatchObject({
      task: expect.objectContaining({ id: "b1" }),
      boardId: "board-b",
      boardTitle: "Beta",
      boardHref: "/boards/board-b",
    });
    expect(entries[2].task.id).toBe("b2");
  });

  it("uses empty task list for boards missing in state", () => {
    const state = makeState({}, [{ id: "empty-board", title: "Пустая" }]);

    expect(selectAllSearchableTasks(state)).toEqual([]);
  });

  it("ignores tasks on boards not listed in catalog", () => {
    const state = makeState(
      {
        orphan: [
          makeBoardTask({ id: "x", status: "todo", order: 0 }),
        ],
      },
      [{ id: "listed", title: "Listed" }],
    );

    expect(selectAllSearchableTasks(state)).toEqual([]);
  });
});
