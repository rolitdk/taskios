"use client";

import { useCallback } from "react";

import { useAppDispatch } from "@/store/hooks";
import { updateTask, type UpdateTaskPayload } from "@/store/slices/tasks-slice";

export function useEditTask() {
  const dispatch = useAppDispatch();

  const editTask = useCallback(
    (payload: UpdateTaskPayload) => {
      dispatch(updateTask(payload));
    },
    [dispatch],
  );

  return { editTask };
}
