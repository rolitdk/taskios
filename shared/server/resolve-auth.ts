import {
  getAccessTokenFromRequest,
  verifyAccessToken,
  type AuthTokenPayload,
} from "@/shared/server/auth";
import { refreshSessionFromRequest } from "@/shared/server/refresh-session";

export type ResolvedAuth = {
  authenticated: boolean;
  userId?: string;
  /** Новые токены — нужно записать в Set-Cookie ответа proxy/API. */
  refreshedTokens?: { accessToken: string; refreshToken: string };
};

export async function resolveAuthFromRequest(
  request: Request,
): Promise<ResolvedAuth> {
  const accessToken = getAccessTokenFromRequest(request);
  if (accessToken) {
    try {
      const payload: AuthTokenPayload = await verifyAccessToken(accessToken);
      return { authenticated: true, userId: payload.userId };
    } catch {
      // access истёк или повреждён — пробуем refresh
    }
  }

  const refreshed = await refreshSessionFromRequest(request);
  if (!refreshed) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    userId: refreshed.userId,
    refreshedTokens: {
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
    },
  };
}
