"use client";

import { useEffect } from "react";

import { useAppDispatch } from "@/store/hooks";
import { setActiveBoard } from "@/store/slices/tasks-slice";

export function useActiveBoard(boardId: string) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setActiveBoard(boardId));
  }, [boardId, dispatch]);
}
