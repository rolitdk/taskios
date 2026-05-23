"use client";

import { useCallback } from "react";

import type { TaskStatus } from "@/modules/board/model/board-types";
import { updateTask as updateTaskRequest } from "@/modules/tasks/api/tasks-api";
import { moveTask, type MoveTaskPayload } from "@/modules/tasks/model/tasks-slice";
import type { AppDispatch } from "@/store/store";
import { useAppDispatch } from "@/store/hooks";

export type MoveTaskInput = MoveTaskPayload & {
  previousStatus: TaskStatus;
  previousOrder: number;
};

type UpdateTaskSort = (
  taskId: string,
  body: { status: TaskStatus; sortOrder: number },
) => Promise<unknown>;

export async function runOptimisticTaskMove(
  dispatch: AppDispatch,
  input: MoveTaskInput,
  updateTaskApi: UpdateTaskSort = updateTaskRequest,
): Promise<boolean> {
  dispatch(
    moveTask({
      boardId: input.boardId,
      taskId: input.taskId,
      status: input.status,
      order: input.order,
    }),
  );

  try {
    await updateTaskApi(input.taskId, {
      status: input.status,
      sortOrder: input.order,
    });
    return true;
  } catch {
    dispatch(
      moveTask({
        boardId: input.boardId,
        taskId: input.taskId,
        status: input.previousStatus,
        order: input.previousOrder,
      }),
    );
    return false;
  }
}

export function useMoveTask() {
  const dispatch = useAppDispatch();

  const moveTaskOnBoard = useCallback(
    (input: MoveTaskInput) => runOptimisticTaskMove(dispatch, input),
    [dispatch],
  );

  return { moveTask: moveTaskOnBoard };
}
