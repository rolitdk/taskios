import { db } from "@/shared/server/db";
import { apiError, noContent, ok } from "@/shared/server/http";
import { getAuthenticatedUserId } from "@/shared/server/session";
import { toPublicTask } from "@/shared/server/task-serializer";
import { normalizeTaskTags, taskTagsToJson } from "@/shared/server/task-tags";
import {
  formatZodErrorMessage,
  updateTaskSchema,
} from "@/shared/server/validation";

async function findTaskForUser(taskId: string, userId: string) {
  return db.task.findFirst({
    where: {
      id: taskId,
      project: {
        members: {
          some: {
            userId,
          },
        },
      },
    },
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return apiError(401, "UNAUTHORIZED", "Требуется авторизация");
  }

  const { id } = await context.params;
  const task = await findTaskForUser(id, userId);
  if (!task) {
    return apiError(404, "TASK_NOT_FOUND", "Задача не найдена");
  }

  return ok({ task });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return apiError(401, "UNAUTHORIZED", "Требуется авторизация");
  }

  const { id } = await context.params;
  const task = await findTaskForUser(id, userId);
  if (!task) {
    return apiError(404, "TASK_NOT_FOUND", "Задача не найдена");
  }

  try {
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        400,
        "VALIDATION_ERROR",
        formatZodErrorMessage(parsed.error),
      );
    }

    const { tags, ...taskData } = parsed.data;
    const updatedTask = await db.task.update({
      where: { id },
      data: {
        ...taskData,
        ...(tags !== undefined
          ? { tags: taskTagsToJson(normalizeTaskTags(tags)) }
          : {}),
      },
    });

    return ok({ task: toPublicTask(updatedTask) });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiError(400, "INVALID_JSON", "Некорректный JSON");
    }

    return apiError(500, "INTERNAL_ERROR", "Внутренняя ошибка сервера");
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return apiError(401, "UNAUTHORIZED", "Требуется авторизация");
  }

  const { id } = await context.params;
  const task = await findTaskForUser(id, userId);
  if (!task) {
    return apiError(404, "TASK_NOT_FOUND", "Задача не найдена");
  }

  await db.task.delete({
    where: { id },
  });

  return noContent();
}
