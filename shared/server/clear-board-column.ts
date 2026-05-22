import { z } from "zod";

import { db } from "@/shared/server/db";
import { taskStatusValues } from "@/shared/server/validation";

const columnStatusSchema = z.enum(taskStatusValues);

export type ColumnStatus = z.infer<typeof columnStatusSchema>;

export function parseColumnStatus(
  statusParam: string | null,
): z.ZodSafeParseResult<ColumnStatus> {
  return columnStatusSchema.safeParse(statusParam);
}

export async function clearBoardColumnTasks(
  boardId: string,
  status: ColumnStatus,
  userId: string,
): Promise<boolean> {
  const project = await db.project.findFirst({
    where: {
      id: boardId,
      members: {
        some: {
          userId,
        },
      },
    },
    select: { id: true },
  });

  if (!project) {
    return false;
  }

  await db.task.deleteMany({
    where: {
      projectId: boardId,
      status,
    },
  });

  return true;
}
