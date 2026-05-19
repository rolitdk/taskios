"use client";

import { useCallback } from "react";

import { useAppDispatch } from "@/store/hooks";
import { removeBoard } from "@/store/slices/tasks-slice";

export function useDeleteBoard() {
  const dispatch = useAppDispatch();

  const deleteBoard = useCallback(
    (boardId: string) => {
      dispatch(removeBoard(boardId));
    },
    [dispatch],
  );

  return { deleteBoard };
}
