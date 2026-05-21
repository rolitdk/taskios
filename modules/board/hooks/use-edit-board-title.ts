"use client";

import { useCallback } from "react";

import { useAppDispatch } from "@/store/hooks";
import { updateBoardTitle } from "@/modules/tasks/model/tasks-slice";

export function useEditBoardTitle() {
  const dispatch = useAppDispatch();

  const editBoardTitle = useCallback(
    (payload: { boardId: string; title: string }) => {
      dispatch(updateBoardTitle(payload));
    },
    [dispatch],
  );

  return { editBoardTitle };
}
