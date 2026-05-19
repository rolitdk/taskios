import {
  createTokenPair,
  hashPassword,
  setAuthCookies,
  verifyPassword,
} from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { apiError, ok } from "@/lib/server/http";
import { toPublicUser } from "@/lib/server/serializers";
import { formatZodErrorMessage, loginSchema } from "@/lib/server/validation";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        400,
        "VALIDATION_ERROR",
        formatZodErrorMessage(parsed.error),
      );
    }

    const user = await db.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    if (!user) {
      return apiError(401, "INVALID_CREDENTIALS", "Неверный email или пароль");
    }

    const isPasswordValid = await verifyPassword(
      parsed.data.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      return apiError(401, "INVALID_CREDENTIALS", "Неверный email или пароль");
    }

    const tokenPair = await createTokenPair(user.id);
    const refreshTokenHash = await hashPassword(tokenPair.refreshToken);

    await db.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    const response = ok({ user: toPublicUser(user) });
    setAuthCookies(response, tokenPair);
    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiError(400, "INVALID_JSON", "Некорректный JSON");
    }

    return apiError(500, "INTERNAL_ERROR", "Внутренняя ошибка сервера");
  }
}
