import {
  createTokenPair,
  hashPassword,
  setAuthCookies,
} from "@/shared/server/auth";
import { db } from "@/shared/server/db";
import {
  apiError,
  created,
  handleAuthRouteError,
  parseRequestJson,
} from "@/shared/server/http";
import { toPublicUser } from "@/shared/server/serializers";
import { formatZodErrorMessage, registerSchema } from "@/shared/server/validation";

export async function POST(request: Request): Promise<Response> {
  try {
    const json = await parseRequestJson(request);
    if (!json.ok) {
      return json.response;
    }

    const parsed = registerSchema.safeParse(json.data);
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
    return handleAuthRouteError(error);
  }
}
