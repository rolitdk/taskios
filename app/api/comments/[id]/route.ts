import { db } from "@/lib/server/db";
import { apiError, noContent, ok } from "@/lib/server/http";
import { getAuthenticatedUserId } from "@/lib/server/session";
import {
  formatZodErrorMessage,
  updateCommentSchema,
} from "@/lib/server/validation";

async function findCommentForUser(commentId: string, userId: string) {
  return db.comment.findFirst({
    where: {
      id: commentId,
      task: {
        project: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    },
  });
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
  const comment = await findCommentForUser(id, userId);
  if (!comment) {
    return apiError(404, "COMMENT_NOT_FOUND", "Комментарий не найден");
  }
  if (comment.authorId !== userId) {
    return apiError(
      403,
      "FORBIDDEN",
      "Можно редактировать только свои комментарии",
    );
  }

  try {
    const body = await request.json();
    const parsed = updateCommentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        400,
        "VALIDATION_ERROR",
        formatZodErrorMessage(parsed.error),
      );
    }

    const updatedComment = await db.comment.update({
      where: { id },
      data: parsed.data,
    });

    return ok({ comment: updatedComment });
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
  const comment = await findCommentForUser(id, userId);
  if (!comment) {
    return apiError(404, "COMMENT_NOT_FOUND", "Комментарий не найден");
  }
  if (comment.authorId !== userId) {
    return apiError(403, "FORBIDDEN", "Можно удалять только свои комментарии");
  }

  await db.comment.delete({
    where: { id },
  });

  return noContent();
}
