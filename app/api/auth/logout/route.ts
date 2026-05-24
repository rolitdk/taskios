import { clearAuthCookies } from "@/shared/server/auth";
import { db } from "@/shared/server/db";
import { ok } from "@/shared/server/http";
import { getAuthenticatedUserId } from "@/shared/server/session";

export async function POST(request: Request): Promise<Response> {
  const userId = getAuthenticatedUserId(request);
  if (userId) {
    await db.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  const response = ok({ success: true });
  clearAuthCookies(response);
  return response;
}
