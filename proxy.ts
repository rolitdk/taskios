import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  isAuthPagePath,
  isPublicPagePath,
} from "@/modules/user/lib/auth-routes";
import { setAuthCookies } from "@/shared/server/auth";
import { resolveAuthFromRequest } from "@/shared/server/resolve-auth";

const publicApiRoutes = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
]);

function withRefreshedCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string } | undefined,
): NextResponse {
  if (tokens) {
    setAuthCookies(response, tokens);
  }
  return response;
}

function handleApiRoute(
  request: NextRequest,
  authenticated: boolean,
  refreshedTokens: { accessToken: string; refreshToken: string } | undefined,
): NextResponse {
  if (publicApiRoutes.has(request.nextUrl.pathname)) {
    return withRefreshedCookies(NextResponse.next(), refreshedTokens);
  }

  if (!authenticated) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Требуется авторизация" } },
      { status: 401 },
    );
  }

  return withRefreshedCookies(NextResponse.next(), refreshedTokens);
}

function handlePageRoute(
  request: NextRequest,
  authenticated: boolean,
  refreshedTokens: { accessToken: string; refreshToken: string } | undefined,
): NextResponse {
  const { pathname } = request.nextUrl;

  if (authenticated && isAuthPagePath(pathname)) {
    return withRefreshedCookies(
      NextResponse.redirect(new URL("/boards", request.url)),
      refreshedTokens,
    );
  }

  if (!authenticated && !isPublicPagePath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return withRefreshedCookies(NextResponse.next(), refreshedTokens);
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { authenticated, refreshedTokens } = await resolveAuthFromRequest(
    request,
  );

  if (request.nextUrl.pathname.startsWith("/api")) {
    return handleApiRoute(request, authenticated, refreshedTokens);
  }

  return handlePageRoute(request, authenticated, refreshedTokens);
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
