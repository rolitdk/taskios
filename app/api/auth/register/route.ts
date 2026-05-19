import {
  createTokenPair,
  hashPassword,
  setAuthCookies,
} from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { apiError, created } from "@/lib/server/http";
import { toPublicUser } from "@/lib/server/serializers";
import { formatZodErrorMessage, registerSchema } from "@/lib/server/validation";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        400,
        "VALIDATION_ERROR",
        formatZodErrorMessage(parsed.error),
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (existingUser) {
      return apiError(
        409,
        "EMAIL_EXISTS",
        "Пользователь с таким email уже существует",
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await db.user.create({
      data: {
        email: parsed.data.email.toLowerCase(),
        passwordHash,
        name: parsed.data.name,
      },
    });

    const tokenPair = await createTokenPair(user.id);
    const refreshTokenHash = await hashPassword(tokenPair.refreshToken);

    await db.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    const response = created({ user: toPublicUser(user) });
    setAuthCookies(response, tokenPair);
    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiError(400, "INVALID_JSON", "Некорректный JSON");
    }

    const message =
      error instanceof Error ? error.message : "Внутренняя ошибка сервера";
    if (message.includes("JWT_")) {
      return apiError(500, "CONFIG_ERROR", "Не настроены JWT секреты");
    }

    return apiError(500, "INTERNAL_ERROR", "Внутренняя ошибка сервера");
  }
}
