"use client";
// Страница конкретной доски задач (клиентская часть)

import { BoardView } from "./board-view";

export function BoardPageClient() {
  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-muted text-xs font-medium tracking-wide uppercase">
            Рабочее пространство
          </p>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Моя доска
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
