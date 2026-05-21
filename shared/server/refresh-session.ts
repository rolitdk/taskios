import {
  createTokenPair,
  getRefreshTokenFromRequest,
  hashPassword,
  verifyPassword,
  verifyRefreshToken,
} from "@/shared/server/auth";
import { db } from "@/shared/server/db";

export type RefreshedSession = {
  userId: string;
  accessToken: string;
  refreshToken: string;
};

/** Обновляет access/refresh по cookie refresh; null — сессии нет или она недействительна. */
export async function refreshSessionFromRequest(
  request: Request,
): Promise<RefreshedSession | null> {
  const refreshToken = getRefreshTokenFromRequest(request);
  if (!refreshToken) {
    return null;
  }

  try {
    const payload = await verifyRefreshToken(refreshToken);
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user?.refreshTokenHash) {
      return null;
    }

    const isStoredTokenValid = await verifyPassword(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!isStoredTokenValid) {
      return null;
    }

    const tokenPair = await createTokenPair(user.id);
    const refreshTokenHash = await hashPassword(tokenPair.refreshToken);

    await db.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      userId: user.id,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    };
  } catch {
    return null;
  }
}
