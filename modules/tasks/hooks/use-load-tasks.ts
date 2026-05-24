"use client";

import { useEffect, useState } from "react";

import { fetchTasks } from "@/modules/tasks/api/tasks-api";
import { groupTasksByBoardId } from "@/modules/tasks/lib/map-task-dto";
import {
  setAllBoardTasks,
  setLoadedBoardIdsKey,
} from "@/modules/tasks/model/tasks-slice";
import { useAuth } from "@/modules/user/providers/auth-provider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type UseLoadTasksOptions = {
  /** Ждать завершения загрузки каталога досок перед запросом задач */
  enabled?: boolean;
};

export function useLoadTasks(options: UseLoadTasksOptions = {}) {
  const { enabled = true } = options;
  const dispatch = useAppDispatch();
  const { user, isLoading: isAuthLoading } = useAuth();
  const boardCatalog = useAppSelector((state) => state.tasks.boardCatalog);
  const loadedBoardIdsKey = useAppSelector(
    (state) => state.tasks.loadedBoardIdsKey,
  );
  const [error, setError] = useState<string | null>(null);

  const boardIdsKey = boardCatalog.map((board) => board.id).join(",");

  useEffect(() => {
    if (isAuthLoading || !enabled) {
      return;
    }

    if (!user) {
      return;
    }

    if (loadedBoardIdsKey === boardIdsKey) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const tasks = await fetchTasks();
        if (!cancelled) {
          dispatch(setAllBoardTasks(groupTasksByBoardId(tasks)));
          setError(null);
        }
      } catch (cause) {
        if (!cancelled) {
          const message =
            cause instanceof Error
              ? cause.message
              : "Не удалось загрузить задачи";
          setError(message);
          dispatch(setLoadedBoardIdsKey(boardIdsKey));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [boardIdsKey, dispatch, enabled, isAuthLoading, loadedBoardIdsKey, user]);

  const isGuestReady = !isAuthLoading && !user;
  const syncedBoardIdsKey = user ? loadedBoardIdsKey : null;
  const isLoading =
    Boolean(user) &&
    enabled &&
    !isAuthLoading &&
    syncedBoardIdsKey !== boardIdsKey;
  const isReady = isGuestReady || (!isLoading && enabled && !isAuthLoading);

  return { isLoading, isReady, error };
}
