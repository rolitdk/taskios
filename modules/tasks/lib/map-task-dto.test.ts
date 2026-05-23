import { describe, expect, it } from "vitest";

import {
  boardTaskFromCreated,
  groupTasksByBoardId,
  mapTasksToBoardTasks,
  taskUpdatePayloadFromDto,
} from "@/modules/tasks/lib/map-task-dto";
import { makeBoardTask } from "@/modules/tasks/lib/__fixtures__/board-tasks";
import { makeTaskDto } from "@/modules/tasks/lib/__fixtures__/task-dto";

describe("mapTasksToBoardTasks", () => {
  it("orders columns todo → doing → review → done and sorts by sortOrder", () => {
    const tasks = mapTasksToBoardTasks([
      makeTaskDto({ id: "done-1", status: "done", sortOrder: 0 }),
      makeTaskDto({ id: "todo-2", status: "todo", sortOrder: 2, title: "B" }),
      makeTaskDto({ id: "doing-1", status: "doing", sortOrder: 0 }),
      makeTaskDto({ id: "todo-1", status: "todo", sortOrder: 0, title: "A" }),
      makeTaskDto({ id: "todo-3", status: "todo", sortOrder: 1, title: "C" }),
    ]);

    expect(tasks.map((task) => task.id)).toEqual([
      "todo-1",
      "todo-3",
      "todo-2",
      "doing-1",
      "done-1",
    ]);
    expect(tasks.map((task) => task.order)).toEqual([0, 1, 2, 0, 0]);
  });

  it("trims title and maps empty description to «Без описания»", () => {
    const [task] = mapTasksToBoardTasks([
      makeTaskDto({
        id: "t1",
        title: "  Заголовок  ",
        description: "   ",
      }),
    ]);

    expect(task.title).toBe("Заголовок");
    expect(task.subtitle).toBe("Без описания");
    expect(task.initials).toBe("З");
  });

  it("keeps trimmed non-empty description as subtitle", () => {
    const [task] = mapTasksToBoardTasks([
      makeTaskDto({
        id: "t1",
        description: "  Подробности  ",
      }),
    ]);

    expect(task.subtitle).toBe("Подробности");
  });

  it("assigns avatar tones by global index across all columns", () => {
    const tasks = mapTasksToBoardTasks([
      makeTaskDto({ id: "a", status: "todo", sortOrder: 0 }),
      makeTaskDto({ id: "b", status: "doing", sortOrder: 0 }),
    ]);

    expect(tasks[0].avatarTone).toBe("soft");
    expect(tasks[1].avatarTone).toBe("muted");
  });

  it("preserves status and tags from DTO", () => {
    const tags = [{ label: "API", tone: "blue" as const }];
    const [task] = mapTasksToBoardTasks([
      makeTaskDto({ id: "t1", status: "review", tags }),
    ]);

    expect(task.status).toBe("review");
    expect(task.tags).toEqual(tags);
  });
});

describe("groupTasksByBoardId", () => {
  it("groups tasks by projectId and maps each board independently", () => {
    const grouped = groupTasksByBoardId([
      makeTaskDto({ id: "a", projectId: "board-a", status: "todo", sortOrder: 1 }),
      makeTaskDto({ id: "b", projectId: "board-b", status: "todo", sortOrder: 0 }),
      makeTaskDto({ id: "c", projectId: "board-a", status: "todo", sortOrder: 0 }),
    ]);

    expect(Object.keys(grouped).sort()).toEqual(["board-a", "board-b"]);
    expect(grouped["board-a"].map((task) => task.id)).toEqual(["c", "a"]);
    expect(grouped["board-b"].map((task) => task.id)).toEqual(["b"]);
  });

  it("returns empty object for no tasks", () => {
    expect(groupTasksByBoardId([])).toEqual({});
  });
});

describe("boardTaskFromCreated", () => {
  it("uses existing task count as avatar index", () => {
    const existing = [
      makeBoardTask({ id: "x", status: "todo", order: 0 }),
      makeBoardTask({ id: "y", status: "doing", order: 0 }),
    ];
    const created = boardTaskFromCreated(
      makeTaskDto({ id: "new", sortOrder: 3, title: "Новая" }),
      existing,
    );

    expect(created.id).toBe("new");
    expect(created.order).toBe(3);
    expect(created.avatarTone).toBe("shell");
  });
});

describe("taskUpdatePayloadFromDto", () => {
  it("maps trimmed fields for Redux update", () => {
    expect(
      taskUpdatePayloadFromDto(
        makeTaskDto({
          id: "t1",
          title: "  Title  ",
          description: "",
          status: "done",
          tags: [{ label: "x", tone: "slate" }],
        }),
      ),
    ).toEqual({
      taskId: "t1",
      title: "Title",
      subtitle: "Без описания",
      status: "done",
      tags: [{ label: "x", tone: "slate" }],
    });
  });
});
