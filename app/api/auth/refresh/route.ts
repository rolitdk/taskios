import { clearAuthCookies, setAuthCookies } from "@/shared/server/auth";
import { apiError, ok } from "@/shared/server/http";
import { refreshSessionFromRequest } from "@/shared/server/refresh-session";

export async function POST(request: Request): Promise<Response> {
  const refreshed = await refreshSessionFromRequest(request);

  if (!refreshed) {
    const response = apiError(401, "UNAUTHORIZED", "Сессия недействительна");
    clearAuthCookies(response);
    return response;
  }

  const response = ok({ userId: refreshed.userId });
  setAuthCookies(response, {
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken,
  });
  return response;
}
