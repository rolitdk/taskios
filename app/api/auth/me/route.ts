import { db } from "@/shared/server/db";
import { apiError, ok } from "@/shared/server/http";
import { toPublicUser } from "@/shared/server/serializers";
import { getAuthenticatedUserId } from "@/shared/server/session";

export async function GET(request: Request): Promise<Response> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return apiError(401, "UNAUTHORIZED", "Требуется авторизация");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return apiError(404, "USER_NOT_FOUND", "Пользователь не найден");
  }

  return ok({ user: toPublicUser(user) });
}
