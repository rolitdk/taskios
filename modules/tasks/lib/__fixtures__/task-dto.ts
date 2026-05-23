import type { TaskDto } from "@/modules/tasks/model/task-api-types";

export function makeTaskDto(
  overrides: Partial<TaskDto> & Pick<TaskDto, "id">,
): TaskDto {
  return {
    projectId: "board-1",
    title: "Задача",
    description: "Описание",
    status: "todo",
    priority: "medium",
    dueDate: "2025-01-01T00:00:00.000Z",
    sortOrder: 0,
    tags: [],
    ...overrides,
  };
}
