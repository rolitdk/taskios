"use client";

import { useCallback, useState } from "react";

import { createBoard as createBoardRequest } from "@/modules/board/api/boards-api";
import { addBoard } from "@/modules/tasks/model/tasks-slice";
import { useAppDispatch } from "@/store/hooks";

export function useCreateBoard() {
  const dispatch = useAppDispatch();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBoard = useCallback(
    async (title: string) => {
      setError(null);
      setIsCreating(true);

      try {
        const board = await createBoardRequest(title);
        dispatch(addBoard(board));
        return true;
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : "Не удалось создать доску. Попробуйте позже.";
        setError(message);
        return false;
      } finally {
        setIsCreating(false);
      }
    },
    [dispatch],
  );

  const clearError = useCallback(() => setError(null), []);

  return { createBoard, isCreating, error, clearError };
}
