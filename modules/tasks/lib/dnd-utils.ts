import {
  COLUMN_DEFINITIONS,
  type BoardTask,
  type TaskStatus,
} from "@/modules/board/model/board-types";

const columnIds = new Set<TaskStatus>(
  COLUMN_DEFINITIONS.map((column) => column.id),
);

export function isColumnId(id: string): id is TaskStatus {
  return columnIds.has(id as TaskStatus);
}

export function resolveDropTarget(
  overId: string,
  tasks: BoardTask[],
): { status: TaskStatus; order: number } | null {
  if (isColumnId(overId)) {
    const columnTasks = tasks
      .filter((task) => task.status === overId)
      .sort((a, b) => a.order - b.order);

    return { status: overId, order: columnTasks.length };
  }

  const overTask = tasks.find((task) => task.id === overId);
  if (!overTask) {
    return null;
  }

  return { status: overTask.status, order: overTask.order };
}
