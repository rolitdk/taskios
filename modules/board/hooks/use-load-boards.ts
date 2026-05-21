"use client";

import { useEffect, useState } from "react";

import { fetchBoards } from "@/modules/board/api/boards-api";
import { useAuth } from "@/modules/user/providers/auth-provider";
import { setBoardCatalog } from "@/modules/tasks/model/tasks-slice";
import { useAppDispatch } from "@/store/hooks";

type FetchPhase = "idle" | "loading" | "done";

export function useLoadBoards() {
  const dispatch = useAppDispatch();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [phase, setPhase] = useState<FetchPhase>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      dispatch(setBoardCatalog([]));
      setPhase("done");
      return;
    }

    let cancelled = false;
    setPhase("loading");
    setError(null);

    async function load() {
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
          setPhase("done");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthLoading, user]);

  const isLoading = isAuthLoading || phase !== "done";
  const isReady = !isAuthLoading && phase === "done";

  return { isLoading, isReady, error };
}
