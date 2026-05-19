import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { NextResponse } from "next/server";

const ACCESS_COOKIE = "taskios_access_token";
const REFRESH_COOKIE = "taskios_refresh_token";
const ACCESS_TTL_SECONDS = 60 * 15;
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7;
const ISSUER = "taskios-api";

type TokenType = "access" | "refresh";

export type AuthTokenPayload = JWTPayload & {
  userId: string;
  type: TokenType;
};

function getRequiredEnv(
  name: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET",
): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getSecret(
  name: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET",
): Uint8Array {
  return new TextEncoder().encode(getRequiredEnv(name));
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function signToken(userId: string, type: TokenType): Promise<string> {
  const expiresIn =
    type === "access" ? ACCESS_TTL_SECONDS : REFRESH_TTL_SECONDS;
  const secretName =
    type === "access" ? "JWT_ACCESS_SECRET" : "JWT_REFRESH_SECRET";

  return new SignJWT({ userId, type })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setExpirationTime(`${expiresIn}s`)
    .sign(getSecret(secretName));
}

export async function createTokenPair(userId: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const [accessToken, refreshToken] = await Promise.all([
    signToken(userId, "access"),
    signToken(userId, "refresh"),
  ]);

  return { accessToken, refreshToken };
}

async function verifyToken(
  token: string,
  type: TokenType,
): Promise<AuthTokenPayload> {
  const secretName =
    type === "access" ? "JWT_ACCESS_SECRET" : "JWT_REFRESH_SECRET";
  const { payload } = await jwtVerify(token, getSecret(secretName), {
    issuer: ISSUER,
  });

  if (payload.type !== type || typeof payload.userId !== "string") {
    throw new Error("Invalid token payload");
  }

  return payload as AuthTokenPayload;
}

export async function verifyAccessToken(
  token: string,
): Promise<AuthTokenPayload> {
  return verifyToken(token, "access");
}

export async function verifyRefreshToken(
  token: string,
): Promise<AuthTokenPayload> {
  return verifyToken(token, "refresh");
}

export function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
): void {
  const commonCookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    ...commonCookieOptions,
    maxAge: ACCESS_TTL_SECONDS,
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    ...commonCookieOptions,
    maxAge: REFRESH_TTL_SECONDS,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set(REFRESH_COOKIE, "", { maxAge: 0, path: "/" });
}

export function getAccessTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((part) => part.trim());
  const target = cookies.find((part) => part.startsWith(`${ACCESS_COOKIE}=`));
  if (!target) {
    return null;
  }

  return decodeURIComponent(target.slice(ACCESS_COOKIE.length + 1));
}

export function getRefreshTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((part) => part.trim());
  const target = cookies.find((part) => part.startsWith(`${REFRESH_COOKIE}=`));
  if (!target) {
    return null;
  }

  return decodeURIComponent(target.slice(REFRESH_COOKIE.length + 1));
}

export const AUTH_COOKIE_NAMES = {
  access: ACCESS_COOKIE,
  refresh: REFRESH_COOKIE,
};
