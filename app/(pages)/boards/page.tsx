import Link from "next/link";

import { AppShell } from "@/components/taskios/app-shell";

export default function BoardsPage() {
  return (
    <AppShell>
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
        <div>
          <p className="text-muted text-xs font-medium tracking-wide uppercase">
            Рабочее пространство
          </p>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Мои доски
          </h1>
          <p className="text-muted mt-2 max-w-lg text-sm">
            Заглушка: здесь появится список ваших досок.
          </p>
        </div>
        <p>
          <Link
            href="/"
            className="text-accent-strong hover:text-foreground text-sm font-medium transition-colors"
          >
            ← К текущей доске
          </Link>
        </p>
      </main>
    </AppShell>
  );
}
