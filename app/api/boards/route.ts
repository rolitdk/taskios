import { db } from "@/shared/server/db";
import { apiError, created, ok } from "@/shared/server/http";
import { toPublicProject } from "@/shared/server/serializers";
import { getAuthenticatedUserId } from "@/shared/server/session";
import {
  createBoardSchema,
  formatZodErrorMessage,
} from "@/shared/server/validation";

const BOARD_CREATE_DEFAULTS = {
  description: "—",
  status: "active" as const,
  budget: 0,
};

function boardDeadline(): Date {
  const deadline = new Date();
  deadline.setFullYear(deadline.getFullYear() + 1);
  return deadline;
}

export async function GET(request: Request): Promise<Response> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return apiError(401, "UNAUTHORIZED", "Требуется авторизация");
  }

  const projects = await db.project.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
    },
  });

  return ok({
    boards: projects.map((project) => ({
      id: project.id,
      title: project.title,
    })),
  });
}

export async function POST(request: Request): Promise<Response> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return apiError(401, "UNAUTHORIZED", "Требуется авторизация");
  }

  try {
    const body = await request.json();
    const parsed = createBoardSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        400,
        "VALIDATION_ERROR",
        formatZodErrorMessage(parsed.error),
      );
    }

    const project = await db.project.create({
      data: {
        title: parsed.data.title,
        clientId: userId,
        ...BOARD_CREATE_DEFAULTS,
        deadline: boardDeadline(),
        members: {
          create: {
            userId,
          },
        },
      },
    });

    const publicProject = toPublicProject(project);

    return created({
      board: {
        id: publicProject.id,
        title: publicProject.title,
      },
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiError(400, "INVALID_JSON", "Некорректный JSON");
    }

    return apiError(500, "INTERNAL_ERROR", "Внутренняя ошибка сервера");
  }
}
