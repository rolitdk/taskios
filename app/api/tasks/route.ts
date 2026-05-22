import {
  clearBoardColumnTasks,
  parseColumnStatus,
} from "@/shared/server/clear-board-column";
import { db } from "@/shared/server/db";
import { apiError, created, noContent, ok } from "@/shared/server/http";
import { getAuthenticatedUserId } from "@/shared/server/session";
import { getNextSortOrder } from "@/shared/server/task-reorder";
import { toPublicTask } from "@/shared/server/task-serializer";
import { normalizeTaskTags, taskTagsToJson } from "@/shared/server/task-tags";
import {
  createTaskSchema,
  formatZodErrorMessage,
} from "@/shared/server/validation";

export async function GET(request: Request): Promise<Response> {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return apiError(401, "UNAUTHORIZED", "Требуется авторизация");
    }

    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");

    const tasks = await db.task.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        project: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
      orderBy: [{ status: "asc" }, { sortOrder: "asc" }],
    });

    return ok({ tasks: tasks.map(toPublicTask) });
  } catch (error) {
    console.error("GET /api/tasks failed:", error);

    return apiError(500, "INTERNAL_ERROR", "Внутренняя ошибка сервера");
  }
}

export async function POST(request: Request): Promise<Response> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return apiError(401, "UNAUTHORIZED", "Требуется авторизация");
  }

  try {
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        400,
        "VALIDATION_ERROR",
        formatZodErrorMessage(parsed.error),
      );
    }

    const hasAccess = await db.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: parsed.data.projectId,
          userId,
        },
      },
    });

    if (!hasAccess) {
      return apiError(404, "PROJECT_NOT_FOUND", "Проект не найден");
    }

    const { tags, ...taskData } = parsed.data;
    const sortOrder = await getNextSortOrder(
      parsed.data.projectId,
      parsed.data.status,
    );
    const task = await db.task.create({
      data: {
        ...taskData,
        sortOrder,
        tags: taskTagsToJson(normalizeTaskTags(tags)),
      },
    });

    return created({ task: toPublicTask(task) });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiError(400, "INVALID_JSON", "Некорректный JSON");
    }

    return apiError(500, "INTERNAL_ERROR", "Внутренняя ошибка сервера");
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return apiError(401, "UNAUTHORIZED", "Требуется авторизация");
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId")?.trim();
  if (!projectId) {
    return apiError(400, "VALIDATION_ERROR", "Укажите projectId доски");
  }

  const parsed = parseColumnStatus(url.searchParams.get("status"));
  if (!parsed.success) {
    return apiError(
      400,
      "VALIDATION_ERROR",
      "Укажите корректный статус колонки",
    );
  }

  const cleared = await clearBoardColumnTasks(projectId, parsed.data, userId);
  if (!cleared) {
    return apiError(404, "BOARD_NOT_FOUND", "Доска не найдена");
  }

  return noContent();
}
