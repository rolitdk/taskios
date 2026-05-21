"use client";

import { useEffect, useState } from "react";

import { fetchBoards } from "@/modules/board/api/boards-api";
import { useAuth } from "@/modules/user/providers/auth-provider";
import { setBoardCatalog } from "@/modules/tasks/model/tasks-slice";
import { useAppDispatch } from "@/store/hooks";

export function useLoadBoards() {
  const dispatch = useAppDispatch();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      dispatch(setBoardCatalog([]));
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const boards = await fetchBoards();
        if (!cancelled) {
          dispatch(setBoardCatalog(boards));
        }
      } catch (cause) {
        if (!cancelled) {
          const message =
            cause instanceof Error
              ? cause.message
              : "Не удалось загрузить доски";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthLoading, user]);

  return { isLoading: isAuthLoading || isLoading, error };
}
