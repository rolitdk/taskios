import { arrayMove } from "@dnd-kit/sortable";

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

function getColumnTasks(tasks: BoardTask[], status: TaskStatus): BoardTask[] {
  return tasks
    .filter((task) => task.status === status)
    .sort((a, b) => a.order - b.order);
}

export function resolveDropTarget(
  overId: string,
  tasks: BoardTask[],
  activeId: string,
): { status: TaskStatus; order: number } | null {
  if (isColumnId(overId)) {
    const columnTasks = getColumnTasks(tasks, overId);
    const activeInColumn = columnTasks.some((task) => task.id === activeId);

    return {
      status: overId,
      order: activeInColumn ? columnTasks.length - 1 : columnTasks.length,
    };
  }

  const overTask = tasks.find((task) => task.id === overId);
  if (!overTask) {
    return null;
  }

  const columnTasks = getColumnTasks(tasks, overTask.status);
  const ids = columnTasks.map((task) => task.id);
  const oldIndex = ids.indexOf(activeId);
  const newIndex = ids.indexOf(overId);

  if (oldIndex === -1 || newIndex === -1) {
    return { status: overTask.status, order: overTask.order };
  }

  const reorderedIds = arrayMove(ids, oldIndex, newIndex);
  const order = reorderedIds.indexOf(activeId);

  return { status: overTask.status, order };
}
