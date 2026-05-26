"use client";

import { useEffect, useState } from "react";

import { fetchTasks } from "@/modules/tasks/api/tasks-api";
import { mapTasksToBoardTasks } from "@/modules/tasks/lib/map-task-dto";
import {
  setBoardTasksFromApi,
  setLoadedBoardIdsKey,
} from "@/modules/tasks/model/tasks-slice";
import { useAuth } from "@/modules/user/providers/auth-provider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type UseLoadTasksOptions = {
  /** Выполнять GET /api/tasks (только на странице конкретной доски) */
  enabled?: boolean;
  boardId?: string;
};

export function useLoadTasks(options: UseLoadTasksOptions = {}) {
  const { enabled = false, boardId } = options;
  const dispatch = useAppDispatch();
  const { user, isLoading: isAuthLoading } = useAuth();
  const loadedBoardIdsKey = useAppSelector(
    (state) => state.tasks.loadedBoardIdsKey,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || isAuthLoading || !boardId) {
      return;
    }

    if (!user) {
      return;
    }

    if (loadedBoardIdsKey === boardId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const tasks = await fetchTasks(boardId);
        if (!cancelled) {
          dispatch(
            setBoardTasksFromApi({
              boardId,
              tasks: mapTasksToBoardTasks(tasks),
            }),
          );
          setError(null);
        }
      } catch (cause) {
        if (!cancelled) {
          const message =
            cause instanceof Error
              ? cause.message
              : "Не удалось загрузить задачи";
          setError(message);
          dispatch(setLoadedBoardIdsKey(boardId));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [boardId, dispatch, enabled, isAuthLoading, loadedBoardIdsKey, user]);

  const isGuestReady = !isAuthLoading && !user;
  const syncedBoardId = user ? loadedBoardIdsKey : null;
  const isLoading =
    enabled &&
    Boolean(user) &&
    Boolean(boardId) &&
    !isAuthLoading &&
    syncedBoardId !== boardId;
  const isReady = !enabled || isGuestReady || (!isLoading && !isAuthLoading);

  return { isLoading, isReady, error };
}
