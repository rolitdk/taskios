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
