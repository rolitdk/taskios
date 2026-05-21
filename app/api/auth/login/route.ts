import {
  createTokenPair,
  hashPassword,
  setAuthCookies,
  verifyPassword,
} from "@/shared/server/auth";
import { db } from "@/shared/server/db";
import {
  apiError,
  handleAuthRouteError,
  ok,
  parseRequestJson,
} from "@/shared/server/http";
import { toPublicUser } from "@/shared/server/serializers";
import { formatZodErrorMessage, loginSchema } from "@/shared/server/validation";

export async function POST(request: Request): Promise<Response> {
  try {
    const json = await parseRequestJson(request);
    if (!json.ok) {
      return json.response;
    }

    const parsed = loginSchema.safeParse(json.data);
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
    return handleAuthRouteError(error);
  }
}
