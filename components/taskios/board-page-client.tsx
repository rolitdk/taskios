"use client";

import Link from "next/link";

import { BoardView } from "@/components/taskios/board-view";
import { useActiveBoard } from "@/hooks/use-active-board";
import { getBoardMeta } from "@/lib/board-catalog";

type BoardPageClientProps = {
  boardId: string;
};

export function BoardPageClient({ boardId }: BoardPageClientProps) {
  useActiveBoard(boardId);

  const board = getBoardMeta(boardId);
  if (!board) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href="/"
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

      <BoardView />
    </main>
  );
}
