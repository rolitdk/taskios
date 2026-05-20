/** Страницы входа и регистрации — доступны без сессии. */
export const AUTH_PAGE_PATHS = ["/login", "/register"] as const;

export function isAuthPagePath(pathname: string): boolean {
  return (AUTH_PAGE_PATHS as readonly string[]).includes(pathname);
}

/** Маркетинговая главная — доступна без сессии. */
export function isLandingPagePath(pathname: string): boolean {
  return pathname === "/";
}

/**
 * Канбан с мок-данными в Redux — пока доступен без авторизации.
 * Уберите из публичных путей, когда будет готов вход.
 */
export function isMockDataPagePath(pathname: string): boolean {
  return pathname === "/boards" || pathname.startsWith("/boards/");
}

export function isPublicPagePath(pathname: string): boolean {
  return (
    isLandingPagePath(pathname) ||
    isAuthPagePath(pathname) ||
    isMockDataPagePath(pathname)
  );
}
