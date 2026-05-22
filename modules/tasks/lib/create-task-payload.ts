import type {
  TaskPriority,
  TaskStatus,
  TaskTag,
} from "@/modules/board/model/board-types";
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
} from "@/modules/tasks/model/task-api-types";

const DEFAULT_PRIORITY: TaskPriority = "medium";

function buildDescription(subtitle: string) {
  return subtitle.trim() || "Без описания";
}

export function buildCreateTaskRequest(
  boardId: string,
  input: {
    title: string;
    subtitle: string;
    status: TaskStatus;
    tags: TaskTag[];
  },
): CreateTaskRequest {
  return {
    projectId: boardId,
    title: input.title.trim(),
    description: buildDescription(input.subtitle),
    status: input.status,
    priority: DEFAULT_PRIORITY,
    dueDate: new Date().toISOString(),
    tags: input.tags,
  };
}

export function buildUpdateTaskRequest(input: {
  title?: string;
  subtitle?: string;
  status?: TaskStatus;
  tags?: TaskTag[];
}): UpdateTaskRequest {
  const request: UpdateTaskRequest = {};

  if (input.title !== undefined) {
    request.title = input.title.trim();
  }
  if (input.subtitle !== undefined) {
    request.description = buildDescription(input.subtitle);
  }
  if (input.status !== undefined) {
    request.status = input.status;
  }
  if (input.tags !== undefined) {
    request.tags = input.tags;
  }

  return request;
}
