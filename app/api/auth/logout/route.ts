import { clearAuthCookies } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok } from "@/lib/server/http";
import { getAuthenticatedUserId } from "@/lib/server/session";

export async function POST(request: Request): Promise<Response> {
  const userId = await getAuthenticatedUserId(request);
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
