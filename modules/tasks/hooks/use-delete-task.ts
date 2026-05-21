"use client";

import { useCallback } from "react";

import { useAppDispatch } from "@/store/hooks";
import { removeTask } from "@/modules/tasks/model/tasks-slice";

export function useDeleteTask() {
  const dispatch = useAppDispatch();

  const deleteTask = useCallback(
    (taskId: string) => {
      dispatch(removeTask(taskId));
    },
    [dispatch],
  );

  return { deleteTask };
}
