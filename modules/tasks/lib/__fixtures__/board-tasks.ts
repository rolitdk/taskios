import type { BoardTask, TaskStatus } from "@/modules/board/model/board-types";

export function makeBoardTask(
  overrides: Partial<BoardTask> & Pick<BoardTask, "id" | "status" | "order">,
): BoardTask {
  return {
    title: "Задача",
    subtitle: "Описание",
    initials: "З",
    avatarTone: "soft",
    tags: [],
    ...overrides,
  };
}

export function tasksInColumn(
  ids: string[],
  status: TaskStatus,
): BoardTask[] {
  return ids.map((id, order) =>
    makeBoardTask({ id, status, order, title: id }),
  );
}
