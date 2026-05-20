/** Страницы входа и регистрации — доступны без сессии. */
export const AUTH_PAGE_PATHS = ["/login", "/register"] as const;

export function isAuthPagePath(pathname: string): boolean {
  return (AUTH_PAGE_PATHS as readonly string[]).includes(pathname);
}

/** Маркетинговая главная — доступна без сессии. */
export function isLandingPagePath(pathname: string): boolean {
  return pathname === "/";
}

export function isPublicPagePath(pathname: string): boolean {
  return isLandingPagePath(pathname) || isAuthPagePath(pathname);
}

/** Безопасный путь после входа (параметр `from` из middleware). */
export function getPostLoginRedirectPath(from: string | null | undefined): string {
  if (!from || !from.startsWith("/") || from.startsWith("//")) {
    return "/boards";
  }

  if (isPublicPagePath(from)) {
    return "/boards";
  }

  return from;
}
