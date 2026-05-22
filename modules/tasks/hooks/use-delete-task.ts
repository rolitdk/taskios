"use client";

import { useCallback, useState } from "react";

import type { BoardTask } from "@/modules/board/model/board-types";
import { deleteTask as deleteTaskRequest } from "@/modules/tasks/api/tasks-api";
import { addTask, removeTask } from "@/modules/tasks/model/tasks-slice";
import { useAppDispatch } from "@/store/hooks";

export type DeleteTaskInput = {
  boardId: string;
  task: BoardTask;
};

export function useDeleteTask() {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTask = useCallback(
    async ({ boardId, task }: DeleteTaskInput) => {
      setError(null);
      setIsDeleting(true);

      dispatch(removeTask({ boardId, taskId: task.id }));

      try {
        await deleteTaskRequest(task.id);
        return true;
      } catch (cause) {
        dispatch(
          addTask({
            boardId,
            id: task.id,
            title: task.title,
            subtitle: task.subtitle,
            status: task.status,
            tags: task.tags,
            order: task.order,
          }),
        );
        const message =
          cause instanceof Error
            ? cause.message
            : "Не удалось удалить задачу. Попробуйте позже.";
        setError(message);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [dispatch],
  );

  const clearError = useCallback(() => setError(null), []);

  return { deleteTask, isDeleting, error, clearError };
}
