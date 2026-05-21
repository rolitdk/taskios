"use client";

import { useCallback, useState } from "react";

import { updateBoard as updateBoardRequest } from "@/modules/board/api/boards-api";
import { updateBoardTitle } from "@/modules/tasks/model/tasks-slice";
import { useAppDispatch } from "@/store/hooks";

export function useEditBoardTitle() {
  const dispatch = useAppDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editBoardTitle = useCallback(
    async (payload: { boardId: string; title: string }) => {
      setError(null);
      setIsSaving(true);

      try {
        const board = await updateBoardRequest(
          payload.boardId,
          payload.title,
        );
        dispatch(
          updateBoardTitle({ boardId: board.id, title: board.title }),
        );
        return true;
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : "Не удалось обновить доску. Попробуйте позже.";
        setError(message);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [dispatch],
  );

  const clearError = useCallback(() => setError(null), []);

  return { editBoardTitle, isSaving, error, clearError };
}
