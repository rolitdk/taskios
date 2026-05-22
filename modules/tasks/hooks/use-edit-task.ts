"use client";

import { useCallback, useState } from "react";

import { updateTask as updateTaskRequest } from "@/modules/tasks/api/tasks-api";
import { buildUpdateTaskRequest } from "@/modules/tasks/lib/create-task-payload";
import { taskUpdatePayloadFromDto } from "@/modules/tasks/lib/map-task-dto";
import { updateTask, type UpdateTaskPayload } from "@/modules/tasks/model/tasks-slice";
import { useAppDispatch } from "@/store/hooks";

type EditTaskInput = UpdateTaskPayload;

export function useEditTask() {
  const dispatch = useAppDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editTask = useCallback(
    async (input: EditTaskInput) => {
      setError(null);
      setIsSaving(true);

      try {
        const request = buildUpdateTaskRequest(input);
        const taskDto = await updateTaskRequest(input.taskId, request);

        dispatch(
          updateTask({
            boardId: input.boardId,
            ...taskUpdatePayloadFromDto(taskDto),
          }),
        );
        return true;
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : "Не удалось сохранить задачу. Попробуйте позже.";
        setError(message);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [dispatch],
  );

  const clearError = useCallback(() => setError(null), []);

  return { editTask, isSaving, error, clearError };
}
