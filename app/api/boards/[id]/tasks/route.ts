import { z } from "zod";

import { db } from "@/shared/server/db";
import { apiError, noContent } from "@/shared/server/http";
import { getAuthenticatedUserId } from "@/shared/server/session";
import { taskStatusValues } from "@/shared/server/validation";

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

const columnStatusSchema = z.enum(taskStatusValues);

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return apiError(401, "UNAUTHORIZED", "Требуется авторизация");
  }

  const { id: boardId } = await context.params;
  if (!(await ensureBoardAccess(boardId, userId))) {
    return apiError(404, "BOARD_NOT_FOUND", "Доска не найдена");
  }

  const statusParam = new URL(request.url).searchParams.get("status");
  const parsed = columnStatusSchema.safeParse(statusParam);
  if (!parsed.success) {
    return apiError(
      400,
      "VALIDATION_ERROR",
      "Укажите корректный статус колонки",
    );
  }

  await db.task.deleteMany({
    where: {
      projectId: boardId,
      status: parsed.data,
    },
  });

  return noContent();
}
