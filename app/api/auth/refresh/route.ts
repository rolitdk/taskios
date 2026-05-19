import {
  clearAuthCookies,
  createTokenPair,
  getRefreshTokenFromRequest,
  hashPassword,
  setAuthCookies,
  verifyPassword,
  verifyRefreshToken,
} from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { apiError, ok } from "@/lib/server/http";

export async function POST(request: Request): Promise<Response> {
  try {
    const refreshToken = getRefreshTokenFromRequest(request);
    if (!refreshToken) {
      return apiError(401, "UNAUTHORIZED", "Требуется авторизация");
    }

    const payload = await verifyRefreshToken(refreshToken);
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user?.refreshTokenHash) {
      const response = apiError(401, "UNAUTHORIZED", "Сессия недействительна");
      clearAuthCookies(response);
      return response;
    }

    const isStoredTokenValid = await verifyPassword(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!isStoredTokenValid) {
      const response = apiError(401, "UNAUTHORIZED", "Сессия недействительна");
      clearAuthCookies(response);
      return response;
    }

    const tokenPair = await createTokenPair(user.id);
    const refreshTokenHash = await hashPassword(tokenPair.refreshToken);

    await db.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    const response = ok({ userId: user.id });
    setAuthCookies(response, tokenPair);
    return response;
  } catch {
    const response = apiError(401, "UNAUTHORIZED", "Сессия недействительна");
    clearAuthCookies(response);
    return response;
  }
}
