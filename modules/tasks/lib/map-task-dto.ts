import type { BoardTask, TaskStatus } from "@/modules/board/model/board-types";
import type { TaskDto } from "@/modules/tasks/model/task-api-types";
import {
  buildTaskInitials,
  pickAvatarTone,
} from "@/modules/tasks/lib/task-avatar";

const COLUMN_ORDER: TaskStatus[] = ["todo", "doing", "review", "done"];

function mapTaskDto(task: TaskDto, order: number, avatarIndex: number): BoardTask {
  const title = task.title.trim();
  const subtitle = task.description.trim() || "Без описания";

  return {
    id: task.id,
    title,
    subtitle,
    initials: buildTaskInitials(title),
    avatarTone: pickAvatarTone(avatarIndex),
    tags: [],
    status: task.status,
    order,
  };
}

export function mapTasksToBoardTasks(tasks: TaskDto[]): BoardTask[] {
  const result: BoardTask[] = [];
  let avatarIndex = 0;

  for (const status of COLUMN_ORDER) {
    const columnTasks = tasks
      .filter((task) => task.status === status)
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      );

    columnTasks.forEach((task, order) => {
      result.push(mapTaskDto(task, order, avatarIndex));
      avatarIndex += 1;
    });
  }

  return result;
}

export function groupTasksByBoardId(
  tasks: TaskDto[],
): Record<string, BoardTask[]> {
  const byBoard = new Map<string, TaskDto[]>();

  for (const task of tasks) {
    const list = byBoard.get(task.projectId) ?? [];
    list.push(task);
    byBoard.set(task.projectId, list);
  }

  const result: Record<string, BoardTask[]> = {};
  for (const [boardId, boardTasks] of byBoard) {
    result[boardId] = mapTasksToBoardTasks(boardTasks);
  }

  return result;
}
