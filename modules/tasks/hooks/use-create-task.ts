"use client";

import { useCallback, useState } from "react";

import type { TaskStatus, TaskTag } from "@/modules/board/model/board-types";
import { createTask as createTaskRequest } from "@/modules/tasks/api/tasks-api";
import { buildCreateTaskRequest } from "@/modules/tasks/lib/create-task-payload";
import { boardTaskFromCreated } from "@/modules/tasks/lib/map-task-dto";
import { addTask } from "@/modules/tasks/model/tasks-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type CreateTaskInput = {
  boardId: string;
  title: string;
  subtitle: string;
  status: TaskStatus;
  tags: TaskTag[];
};

export function useCreateTask() {
  const dispatch = useAppDispatch();
  const boards = useAppSelector((state) => state.tasks.boards);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      setError(null);
      setIsCreating(true);

      try {
        const request = buildCreateTaskRequest(input.boardId, input);
        const taskDto = await createTaskRequest(request);
        const boardTasks = boards[input.boardId] ?? [];
        const boardTask = boardTaskFromCreated(taskDto, boardTasks);

        dispatch(
          addTask({
            boardId: input.boardId,
            id: boardTask.id,
            title: boardTask.title,
            subtitle: boardTask.subtitle,
            status: boardTask.status,
            tags: boardTask.tags,
          }),
        );
        return true;
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : "Не удалось создать задачу. Попробуйте позже.";
        setError(message);
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [boards, dispatch],
  );

  const clearError = useCallback(() => setError(null), []);

  return { createTask, isCreating, error, clearError };
}
