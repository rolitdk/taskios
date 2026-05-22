"use client";

import { useCallback } from "react";

import type { TaskStatus } from "@/modules/board/model/board-types";
import { updateTask as updateTaskRequest } from "@/modules/tasks/api/tasks-api";
import { moveTask, type MoveTaskPayload } from "@/modules/tasks/model/tasks-slice";
import { useAppDispatch } from "@/store/hooks";

type MoveTaskInput = MoveTaskPayload & {
  previousStatus: TaskStatus;
  previousOrder: number;
};

export function useMoveTask() {
  const dispatch = useAppDispatch();

  const moveTaskOnBoard = useCallback(
    async (input: MoveTaskInput) => {
      dispatch(
        moveTask({
          boardId: input.boardId,
          taskId: input.taskId,
          status: input.status,
          order: input.order,
        }),
      );

      if (input.previousStatus === input.status) {
        return true;
      }

      try {
        await updateTaskRequest(input.taskId, { status: input.status });
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
    },
    [dispatch],
  );

  return { moveTask: moveTaskOnBoard };
}
