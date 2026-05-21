"use client";

import { useCallback, useState } from "react";

import { deleteBoard as deleteBoardRequest } from "@/modules/board/api/boards-api";
import { removeBoard } from "@/modules/tasks/model/tasks-slice";
import { useAppDispatch } from "@/store/hooks";

export function useDeleteBoard() {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBoard = useCallback(
    async (boardId: string) => {
      setError(null);
      setIsDeleting(true);

      try {
        await deleteBoardRequest(boardId);
        dispatch(removeBoard(boardId));
        return true;
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : "Не удалось удалить доску. Попробуйте позже.";
        setError(message);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [dispatch],
  );

  const clearError = useCallback(() => setError(null), []);

  return { deleteBoard, isDeleting, error, clearError };
}
