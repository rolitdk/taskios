import { db } from "@/shared/server/db";
import { apiError, noContent, ok } from "@/shared/server/http";
import { requireAuthenticatedUserId } from "@/shared/server/session";
import {
  formatZodErrorMessage,
  updateBoardSchema,
} from "@/shared/server/validation";

async function ensureBoardAccess(
  boardId: string,
  userId: string,
): Promise<boolean> {
  const project = await db.project.findFirst({
    where: {
      id: boardId,
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = requireAuthenticatedUserId(request);

  const { id } = await context.params;
  if (!(await ensureBoardAccess(id, userId))) {
    return apiError(404, "BOARD_NOT_FOUND", "Доска не найдена");
  }

  try {
    const body = await request.json();
    const parsed = updateBoardSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        400,
        "VALIDATION_ERROR",
        formatZodErrorMessage(parsed.error),
      );
    }

    const project = await db.project.update({
      where: { id },
      data: { title: parsed.data.title },
      select: { id: true, title: true },
    });

    return ok({
      board: {
        id: project.id,
        title: project.title,
      },
    });
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
  if (!(await ensureBoardAccess(id, userId))) {
    return apiError(404, "BOARD_NOT_FOUND", "Доска не найдена");
  }

  await db.project.delete({
    where: { id },
  });

  return noContent();
}
