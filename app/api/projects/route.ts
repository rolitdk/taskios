import { db } from "@/shared/server/db";
import { apiError, created, ok } from "@/shared/server/http";
import { getAuthenticatedUserId } from "@/shared/server/session";
import {
  createProjectSchema,
  formatZodErrorMessage,
} from "@/shared/server/validation";

export async function GET(request: Request): Promise<Response> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return apiError(401, "UNAUTHORIZED", "Требуется авторизация");
  }

  const projects = await db.project.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return ok({ projects });
}

export async function POST(request: Request): Promise<Response> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return apiError(401, "UNAUTHORIZED", "Требуется авторизация");
  }

  try {
    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        400,
        "VALIDATION_ERROR",
        formatZodErrorMessage(parsed.error),
      );
    }

    const project = await db.project.create({
      data: {
        ...parsed.data,
        members: {
          create: {
            userId,
          },
        },
      },
    });

    return created({ project });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiError(400, "INVALID_JSON", "Некорректный JSON");
    }

    return apiError(500, "INTERNAL_ERROR", "Внутренняя ошибка сервера");
  }
}
