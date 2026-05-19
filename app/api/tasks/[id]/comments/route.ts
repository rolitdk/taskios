import { db } from "@/lib/server/db";
import { apiError, created, ok } from "@/lib/server/http";
import { getAuthenticatedUserId } from "@/lib/server/session";
import {
  createCommentSchema,
  formatZodErrorMessage,
} from "@/lib/server/validation";

async function ensureTaskAccess(
  taskId: string,
  userId: string,
): Promise<boolean> {
  const task = await db.task.findFirst({
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
    select: { id: true },
  });

  return Boolean(task);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return apiError(401, "UNAUTHORIZED", "Требуется авторизация");
  }

  const { id: taskId } = await context.params;
  if (!(await ensureTaskAccess(taskId, userId))) {
    return apiError(404, "TASK_NOT_FOUND", "Задача не найдена");
  }

  const comments = await db.comment.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
  });

  return ok({ comments });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return apiError(401, "UNAUTHORIZED", "Требуется авторизация");
  }

  const { id: taskId } = await context.params;
  if (!(await ensureTaskAccess(taskId, userId))) {
    return apiError(404, "TASK_NOT_FOUND", "Задача не найдена");
  }

  try {
    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        400,
        "VALIDATION_ERROR",
        formatZodErrorMessage(parsed.error),
      );
    }

    const comment = await db.comment.create({
      data: {
        taskId,
        authorId: userId,
        text: parsed.data.text,
      },
    });

    return created({ comment });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiError(400, "INVALID_JSON", "Некорректный JSON");
    }

    return apiError(500, "INTERNAL_ERROR", "Внутренняя ошибка сервера");
  }
}
