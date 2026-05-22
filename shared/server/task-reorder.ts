import type { Task, TaskStatus } from "@prisma/client";

import { db } from "@/shared/server/db";

function clampOrder(order: number, columnSize: number): number {
  return Math.max(0, Math.min(order, columnSize));
}

async function reindexColumn(
  projectId: string,
  status: TaskStatus,
  excludeTaskId?: string,
): Promise<void> {
  const tasks = await db.task.findMany({
    where: {
      projectId,
      status,
      ...(excludeTaskId ? { id: { not: excludeTaskId } } : {}),
    },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });

  await Promise.all(
    tasks.map((task, index) =>
      db.task.update({
        where: { id: task.id },
        data: { sortOrder: index },
      }),
    ),
  );
}

export async function moveTaskToPosition(
  task: Pick<Task, "id" | "projectId" | "status" | "sortOrder">,
  targetStatus: TaskStatus,
  targetOrder: number,
): Promise<void> {
  const { id: taskId, projectId } = task;
  const sourceStatus = task.status;

  if (sourceStatus === targetStatus && task.sortOrder === targetOrder) {
    return;
  }

  await db.$transaction(async (tx) => {
    if (sourceStatus !== targetStatus) {
      const sourceTasks = await tx.task.findMany({
        where: { projectId, status: sourceStatus, id: { not: taskId } },
        orderBy: { sortOrder: "asc" },
        select: { id: true },
      });

      await Promise.all(
        sourceTasks.map((item, index) =>
          tx.task.update({
            where: { id: item.id },
            data: { sortOrder: index },
          }),
        ),
      );
    }

    const targetTasks = await tx.task.findMany({
      where: { projectId, status: targetStatus, id: { not: taskId } },
      orderBy: { sortOrder: "asc" },
      select: { id: true },
    });

    const order = clampOrder(targetOrder, targetTasks.length);
    const orderedIds = targetTasks.map((item) => item.id);
    orderedIds.splice(order, 0, taskId);

    await Promise.all(
      orderedIds.map((id, index) =>
        tx.task.update({
          where: { id },
          data: {
            sortOrder: index,
            ...(id === taskId ? { status: targetStatus } : {}),
          },
        }),
      ),
    );
  });
}

export async function getNextSortOrder(
  projectId: string,
  status: TaskStatus,
): Promise<number> {
  const aggregate = await db.task.aggregate({
    where: { projectId, status },
    _max: { sortOrder: true },
  });

  return (aggregate._max.sortOrder ?? -1) + 1;
}

export async function reindexColumnAfterDelete(
  projectId: string,
  status: TaskStatus,
): Promise<void> {
  await reindexColumn(projectId, status);
}
