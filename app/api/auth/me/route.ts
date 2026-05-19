import { db } from "@/lib/server/db";
import { apiError, ok } from "@/lib/server/http";
import { toPublicUser } from "@/lib/server/serializers";
import { getAuthenticatedUserId } from "@/lib/server/session";

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
