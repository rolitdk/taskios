import { NextResponse } from "next/server";

type ErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

export function ok<T>(data: T, init?: ResponseInit): NextResponse<T> {
  return NextResponse.json(data, { status: 200, ...init });
}

export function created<T>(data: T, init?: ResponseInit): NextResponse<T> {
  return NextResponse.json(data, { status: 201, ...init });
}

export function noContent(init?: ResponseInit): Response {
  return new Response(null, { status: 204, ...init });
}

export function apiError(
  status: number,
  code: string,
  message: string,
): NextResponse<ErrorBody> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status },
  );
}

export async function parseRequestJson(
  request: Request,
): Promise<
  { ok: true; data: unknown } | { ok: false; response: NextResponse<ErrorBody> }
> {
  try {
    return { ok: true, data: await request.json() };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        ok: false,
        response: apiError(400, "INVALID_JSON", "Некорректный JSON"),
      };
    }
    throw error;
  }
}

export function handleAuthRouteError(error: unknown): NextResponse<ErrorBody> {
  const message =
    error instanceof Error ? error.message : "Внутренняя ошибка сервера";
  if (message.includes("JWT_")) {
    return apiError(500, "CONFIG_ERROR", "Не настроены JWT секреты");
  }

  return apiError(500, "INTERNAL_ERROR", "Внутренняя ошибка сервера");
}
