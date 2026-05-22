"use client";

import { useCallback, useState } from "react";

import type { TaskStatus } from "@/modules/board/model/board-types";
import { clearColumnTasks as clearColumnTasksRequest } from "@/modules/tasks/api/tasks-api";
import { clearColumnTasks } from "@/modules/tasks/model/tasks-slice";
import { useAppDispatch } from "@/store/hooks";

export function useClearColumnTasks() {
  const dispatch = useAppDispatch();
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearColumn = useCallback(
    async (boardId: string, status: TaskStatus) => {
      setError(null);
      setIsClearing(true);

      try {
        await clearColumnTasksRequest(boardId, status);
        dispatch(clearColumnTasks({ boardId, status }));
        return true;
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : "Не удалось очистить колонку. Попробуйте позже.";
        setError(message);
        return false;
      } finally {
        setIsClearing(false);
      }
    },
    [dispatch],
  );

  const clearError = useCallback(() => setError(null), []);

  return { clearColumn, isClearing, error, clearError };
}
