"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { BoardView } from "@/modules/board/ui/board-view";
import { useActiveBoard } from "@/modules/board/hooks/use-active-board";
import { useLoadTasks } from "@/modules/tasks/hooks/use-load-tasks";
import { useAuth } from "@/modules/user/providers/auth-provider";
import { BOARD_HIGHLIGHT_TASK_QUERY } from "@/modules/board/model/board-catalog";
import { useAppSelector } from "@/store/hooks";
import { selectBoardCatalogItemById } from "@/modules/board/store/board-selectors";

const HIGHLIGHT_DURATION_MS = 3500;

type BoardPageClientProps = {
  boardId: string;
};

export function BoardPageClient({ boardId }: BoardPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const highlightedTaskId = searchParams.get(BOARD_HIGHLIGHT_TASK_QUERY);
  const { user, isLoading: isAuthLoading } = useAuth();
  useActiveBoard(boardId);
  const boardCatalogIdsKey = useAppSelector(
    (state) => state.tasks.boardCatalogIdsKey,
  );

  const board = useAppSelector((state) =>
    selectBoardCatalogItemById(state, boardId),
  );
  const catalogSynced = !user || boardCatalogIdsKey !== null;
  const { isLoading: isTasksLoading, error: tasksLoadError } = useLoadTasks({
    enabled: catalogSynced,
    boardId,
  });

  useEffect(() => {
    if (!highlightedTaskId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.replace(pathname, { scroll: false });
    }, HIGHLIGHT_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [highlightedTaskId, pathname, router]);

  useEffect(() => {
    if (isAuthLoading || !catalogSynced) {
      return;
    }

    if (!board) {
      router.replace("/boards");
    }
  }, [board, catalogSynced, isAuthLoading, router]);

  const isPageLoading =
    isAuthLoading || !catalogSynced || isTasksLoading || !board;

  if (isPageLoading) {
    return (
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-6 sm:px-6">
        <p className="text-muted text-sm">
          {!catalogSynced
            ? "Загрузка доски…"
            : isTasksLoading
              ? "Загрузка задач…"
              : "Загрузка…"}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href="/boards"
            className="text-accent-strong hover:text-foreground mb-2 inline-flex items-center gap-1 text-sm font-medium transition-colors"
          >
            <span aria-hidden>←</span>К моим доскам
          </Link>
          <p className="text-muted text-xs font-medium tracking-wide uppercase">
            Рабочее пространство
          </p>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            {board.title}
          </h1>
        </div>
        {tasksLoadError ? (
          <p className="text-sm text-red-600" role="alert">
            {tasksLoadError}
          </p>
        ) : null}
      </div>

      <BoardView boardId={boardId} highlightedTaskId={highlightedTaskId} />
    </main>
  );
}
