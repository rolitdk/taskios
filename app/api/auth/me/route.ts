import { db } from "@/shared/server/db";
import { apiError, ok } from "@/shared/server/http";
import { toPublicUser } from "@/shared/server/serializers";
import { requireAuthenticatedUserId } from "@/shared/server/session";

export async function GET(request: Request): Promise<Response> {
  const userId = requireAuthenticatedUserId(request);

  const user = await db.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return apiError(404, "USER_NOT_FOUND", "Пользователь не найден");
  }

  return ok({ user: toPublicUser(user) });
}
