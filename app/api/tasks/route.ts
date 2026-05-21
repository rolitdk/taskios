import { db } from "@/shared/server/db";
import { apiError, created, ok } from "@/shared/server/http";
import { getAuthenticatedUserId } from "@/shared/server/session";
import {
  createTaskSchema,
  formatZodErrorMessage,
} from "@/shared/server/validation";

export async function GET(request: Request): Promise<Response> {
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
    orderBy: {
      dueDate: "asc",
    },
  });

  return ok({ tasks });
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

    const task = await db.task.create({
      data: parsed.data,
    });

    return created({ task });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiError(400, "INVALID_JSON", "Некорректный JSON");
    }

    return apiError(500, "INTERNAL_ERROR", "Внутренняя ошибка сервера");
  }
}
