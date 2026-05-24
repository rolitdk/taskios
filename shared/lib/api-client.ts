import type { ApiErrorBody } from "@/modules/user/model/auth-types";
import { dedupeAsync } from "@/shared/lib/dedupe-async";

const REFRESH_URL = "/api/auth/refresh";

const NO_REFRESH_ON_401 = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
]);

function getPathname(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input.startsWith("http")
      ? new URL(input).pathname
      : (input.split("?")[0] ?? input);
  }
  if (input instanceof URL) {
    return input.pathname;
  }
  return new URL(input.url).pathname;
}

function shouldRefreshOn401(input: RequestInfo | URL): boolean {
  const pathname = getPathname(input);
  return pathname.startsWith("/api/") && !NO_REFRESH_ON_401.has(pathname);
}

export async function refreshAuthSession(): Promise<boolean> {
  return dedupeAsync("auth:refresh", async () => {
    const response = await fetch(REFRESH_URL, { method: "POST" });
    return response.ok;
  });
}

/** Fetch для data/auth API: при 401 один раз обновляет сессию и повторяет запрос. */
export async function fetchDataApi(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);

  if (response.status !== 401 || !shouldRefreshOn401(input)) {
    return response;
  }

  const refreshed = await refreshAuthSession();
  if (!refreshed) {
    return response;
  }

  return fetch(input, init);
}

export async function readResponseJson<T>(
  response: Response,
): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function getApiErrorMessage(body: unknown, fallback: string): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as ApiErrorBody).error?.message === "string"
  ) {
    return (body as ApiErrorBody).error.message;
  }

  return fallback;
}
