"use client";

import { useCallback } from "react";

import { useAppDispatch } from "@/store/hooks";
import { addBoard } from "@/modules/tasks/model/tasks-slice";

export function useCreateBoard() {
  const dispatch = useAppDispatch();

  const createBoard = useCallback(
    (title: string) => {
      dispatch(addBoard({ title }));
    },
    [dispatch],
  );

  return { createBoard };
}
