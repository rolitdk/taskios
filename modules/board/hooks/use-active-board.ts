"use client";

import { useLayoutEffect } from "react";

import { setActiveBoard } from "@/modules/tasks/model/tasks-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function useActiveBoard(boardId: string) {
  const dispatch = useAppDispatch();
  const boardExists = useAppSelector((state) =>
    state.tasks.boardMetas.some((board) => board.id === boardId),
  );

  useLayoutEffect(() => {
    if (!boardExists) {
      return;
    }

    dispatch(setActiveBoard(boardId));
  }, [boardId, boardExists, dispatch]);
}
