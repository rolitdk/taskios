import type { TaskStatus } from "@/modules/board/model/board-types";
import type { ApiErrorBody } from "@/modules/user/model/auth-types";
import { getApiErrorMessage, readResponseJson } from "@/shared/lib/api-client";

const BOARDS_API = "/api/boards";

export class TasksApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TasksApiError";
  }
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
