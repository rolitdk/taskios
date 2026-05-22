import type { TaskStatus } from "@/modules/board/model/board-types";
import type { ApiErrorBody } from "@/modules/user/model/auth-types";
import type {
  CreateTaskRequest,
  CreateTaskResponse,
  TaskDto,
  TasksListResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
} from "@/modules/tasks/model/task-api-types";
import { getApiErrorMessage, readResponseJson } from "@/shared/lib/api-client";

const BOARDS_API = "/api/boards";
const TASKS_API = "/api/tasks";

export class TasksApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TasksApiError";
  }
}

async function parseTasksResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const body = await readResponseJson<T | ApiErrorBody>(response);

  if (!response.ok) {
    throw new TasksApiError(getApiErrorMessage(body, fallbackMessage));
  }

  if (
    !body ||
    (typeof body === "object" && body !== null && "error" in body)
  ) {
    throw new TasksApiError(fallbackMessage);
  }

  return body as T;
}

export async function createTask(
  payload: CreateTaskRequest,
): Promise<TaskDto> {
  const response = await fetch(TASKS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await parseTasksResponse<CreateTaskResponse>(
    response,
    "Не удалось создать задачу",
  );

  return body.task;
}

export async function updateTask(
  taskId: string,
  payload: UpdateTaskRequest,
): Promise<TaskDto> {
  const response = await fetch(`${TASKS_API}/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await parseTasksResponse<UpdateTaskResponse>(
    response,
    "Не удалось сохранить задачу",
  );

  return body.task;
}

export async function fetchTasks(boardId?: string): Promise<TaskDto[]> {
  const query = boardId
    ? `?projectId=${encodeURIComponent(boardId)}`
    : "";
  const response = await fetch(`${TASKS_API}${query}`, { method: "GET" });
  const body = await parseTasksResponse<TasksListResponse>(
    response,
    "Не удалось загрузить задачи",
  );

  return body.tasks;
}

export async function clearColumnTasks(
  boardId: string,
  status: TaskStatus,
): Promise<void> {
  const response = await fetch(
    `${BOARDS_API}/${boardId}/tasks?status=${encodeURIComponent(status)}`,
    { method: "DELETE" },
  );

  if (response.status === 204) {
    return;
  }

  const body = await readResponseJson<ApiErrorBody>(response);
  throw new TasksApiError(
    getApiErrorMessage(body, "Не удалось очистить колонку"),
  );
}
