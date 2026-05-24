import { db } from "@/shared/server/db";
import { apiError, noContent, ok } from "@/shared/server/http";
import { requireAuthenticatedUserId } from "@/shared/server/session";
import {
  formatZodErrorMessage,
  updateProjectSchema,
} from "@/shared/server/validation";

async function ensureProjectAccess(
  projectId: string,
  userId: string,
): Promise<boolean> {
  const project = await db.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId,
        },
      },
    },
    select: { id: true },
  });

  return Boolean(project);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = requireAuthenticatedUserId(request);

  const { id } = await context.params;
  const project = await db.project.findFirst({
    where: {
      id,
      members: {
        some: {
          userId,
        },
      },
    },
  });
  if (!project) {
    return apiError(404, "PROJECT_NOT_FOUND", "Проект не найден");
  }

  return ok({ project });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = requireAuthenticatedUserId(request);

  const { id } = await context.params;
  if (!(await ensureProjectAccess(id, userId))) {
    return apiError(404, "PROJECT_NOT_FOUND", "Проект не найден");
  }

  try {
    const body = await request.json();
    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        400,
        "VALIDATION_ERROR",
        formatZodErrorMessage(parsed.error),
      );
    }

    const project = await db.project.update({
      where: { id },
      data: parsed.data,
    });

    return ok({ project });
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
  const userId = requireAuthenticatedUserId(request);

  const { id } = await context.params;
  if (!(await ensureProjectAccess(id, userId))) {
    return apiError(404, "PROJECT_NOT_FOUND", "Проект не найден");
  }

  await db.project.delete({
    where: { id },
  });

  return noContent();
}
