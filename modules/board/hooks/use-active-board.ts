"use client";

import { useLayoutEffect } from "react";

import { useAppDispatch } from "@/store/hooks";
import { setActiveBoard } from "@/modules/tasks/model/tasks-slice";

export function useActiveBoard(boardId: string) {
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    dispatch(setActiveBoard(boardId));
  }, [boardId, dispatch]);
}
