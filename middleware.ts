import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAMES, verifyAccessToken } from "@/lib/server/auth";

const publicApiRoutes = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
]);

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (publicApiRoutes.has(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAMES.access)?.value;
  if (!token) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Требуется авторизация" } },
      { status: 401 },
    );
  }

  try {
    await verifyAccessToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Сессия недействительна" } },
      { status: 401 },
    );
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
