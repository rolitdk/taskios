import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  isAuthPagePath,
  isPublicPagePath,
} from "@/modules/user/lib/auth-routes";
import { AUTH_COOKIE_NAMES, verifyAccessToken } from "@/shared/server/auth";

const publicApiRoutes = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
]);

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  if (!token) {
    return false;
  }

  try {
    await verifyAccessToken(token);
    return true;
  } catch {
    return false;
  }
}

function handleApiRoute(
  request: NextRequest,
  authenticated: boolean,
): NextResponse {
  if (publicApiRoutes.has(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (!authenticated) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Требуется авторизация" } },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

function handlePageRoute(
  request: NextRequest,
  authenticated: boolean,
): NextResponse {
  const { pathname } = request.nextUrl;

  if (authenticated && isAuthPagePath(pathname)) {
    return NextResponse.redirect(new URL("/boards", request.url));
  }

  if (!authenticated && !isPublicPagePath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const authenticated = await isAuthenticated(request);

  if (request.nextUrl.pathname.startsWith("/api")) {
    return handleApiRoute(request, authenticated);
  }

  return handlePageRoute(request, authenticated);
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
