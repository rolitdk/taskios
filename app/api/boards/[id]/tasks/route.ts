import { apiError, noContent } from "@/shared/server/http";
import {
  clearBoardColumnTasks,
  parseColumnStatus,
} from "@/shared/server/clear-board-column";
import { getAuthenticatedUserId } from "@/shared/server/session";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return apiError(401, "UNAUTHORIZED", "Требуется авторизация");
  }

  const { id: boardId } = await context.params;
  const statusParam = new URL(request.url).searchParams.get("status");
  const parsed = parseColumnStatus(statusParam);
  if (!parsed.success) {
    return apiError(
      400,
      "VALIDATION_ERROR",
      "Укажите корректный статус колонки",
    );
  }

  const cleared = await clearBoardColumnTasks(boardId, parsed.data, userId);
  if (!cleared) {
    return apiError(404, "BOARD_NOT_FOUND", "Доска не найдена");
  }

  return noContent();
}
