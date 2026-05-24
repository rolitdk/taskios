import { AUTH_USER_ID_HEADER } from "@/shared/server/auth-context";

export function getAuthenticatedUserId(request: Request): string | null {
  return request.headers.get(AUTH_USER_ID_HEADER);
}

/** Для защищённых API: userId уже проверен в proxy. */
export function requireAuthenticatedUserId(request: Request): string {
  const userId = getAuthenticatedUserId(request);
  if (!userId) {
    throw new Error(
      "Отсутствует контекст авторизации: proxy должен установить заголовок user id",
    );
  }
  return userId;
}
