import Link from "next/link";

import { AppShell } from "@/components/taskios/app-shell";
import { ALL_BOARD_METAS } from "@/lib/board-catalog";

export default function BoardsPage() {
  return (
    <AppShell>
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
        <header>
          <p className="text-muted text-xs font-medium tracking-wide uppercase">
            Рабочее пространство
          </p>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Мои доски
          </h1>
        </header>
        <ul className="flex flex-col gap-2">
          {ALL_BOARD_METAS.map((board) => (
            <li key={board.id}>
              <Link
                href={board.href}
                className="bg-surface text-foreground hover:border-purple-300 block rounded-2xl border border-transparent px-4 py-3 text-sm font-medium shadow-sm ring-1 ring-black/5 transition-colors"
              >
                {board.title}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </AppShell>
  );
}
