"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { BoardView } from "@/modules/board/ui/board-view";
import { useActiveBoard } from "@/modules/board/hooks/use-active-board";
import { useLoadBoards } from "@/modules/board/hooks/use-load-boards";
import { BOARD_HIGHLIGHT_TASK_QUERY } from "@/modules/board/model/board-catalog";
import { useAppSelector } from "@/store/hooks";
import { selectBoardMetaById } from "@/modules/board/store/board-selectors";

const HIGHLIGHT_DURATION_MS = 3500;

type BoardPageClientProps = {
  boardId: string;
};

export function BoardPageClient({ boardId }: BoardPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const highlightedTaskId = searchParams.get(BOARD_HIGHLIGHT_TASK_QUERY);
  useActiveBoard(boardId);
  const { isLoading: isBoardsLoading, isReady: isBoardsReady } = useLoadBoards();

  const board = useAppSelector((state) => selectBoardMetaById(state, boardId));

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
    if (!isBoardsReady) {
      return;
    }

    if (!board) {
      router.replace("/boards");
    }
  }, [board, isBoardsReady, router]);

  if (isBoardsLoading || !board) {
    return (
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-6 sm:px-6">
        <p className="text-muted text-sm">Загрузка доски…</p>
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
        <span className="bg-surface text-muted rounded-full px-3 py-1 text-xs font-medium shadow-sm ring-1 ring-black/5">
          Локальное состояние · Redux
        </span>
      </div>

      <BoardView boardId={boardId} highlightedTaskId={highlightedTaskId} />
    </main>
  );
}
