"use client";

import { useEffect, useState } from "react";

import { fetchBoards } from "@/modules/board/api/boards-api";
import { useAuth } from "@/modules/user/providers/auth-provider";
import {
  setBoardCatalog,
  setBoardCatalogIdsKey,
} from "@/modules/tasks/model/tasks-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function useLoadBoards() {
  const dispatch = useAppDispatch();
  const { user, isLoading: isAuthLoading } = useAuth();
  const boardCatalog = useAppSelector((state) => state.tasks.boardCatalog);
  const boardCatalogIdsKey = useAppSelector(
    (state) => state.tasks.boardCatalogIdsKey,
  );
  const [error, setError] = useState<string | null>(null);

  const boardIdsKey = boardCatalog.map((board) => board.id).join(",");

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      if (boardCatalog.length > 0 || boardCatalogIdsKey !== null) {
        dispatch(setBoardCatalog([]));
        dispatch(setBoardCatalogIdsKey(null));
      }
      return;
    }

    if (boardCatalogIdsKey === boardIdsKey) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const boards = await fetchBoards();
        if (!cancelled) {
          dispatch(setBoardCatalog(boards));
          setError(null);
        }
      } catch (cause) {
        if (!cancelled) {
          const message =
            cause instanceof Error
              ? cause.message
              : "Не удалось загрузить доски";
          setError(message);
          dispatch(setBoardCatalogIdsKey(boardIdsKey));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    boardCatalog.length,
    boardCatalogIdsKey,
    boardIdsKey,
    dispatch,
    isAuthLoading,
    user,
  ]);

  const isGuestReady = !isAuthLoading && !user;
  const syncedCatalogKey = user ? boardCatalogIdsKey : null;
  const isLoading =
    Boolean(user) && !isAuthLoading && syncedCatalogKey !== boardIdsKey;
  const isReady = isGuestReady || (!isLoading && !isAuthLoading);

  return { isLoading, isReady, error };
}
