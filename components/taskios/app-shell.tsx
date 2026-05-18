import Link from "next/link";

import { GlobalSearch } from "@/components/taskios/global-search";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-shell-bg border-accent-soft/60 text-foreground sticky top-0 z-10 border-b shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-accent-strong flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span
              className="bg-accent-soft flex h-9 w-9 items-center justify-center rounded-2xl text-base shadow-inner ring-1 ring-purple-200/50"
              aria-hidden
            >
              ✓
            </span>
            Taskios
          </Link>

          <div className="hidden min-w-0 flex-1 md:block">
            <GlobalSearch />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="bg-accent text-foreground hover:bg-accent-strong flex h-10 w-10 items-center justify-center rounded-2xl text-xl font-light text-white shadow-sm transition-colors"
              aria-label="Создать"
            >
              +
            </button>
            <button
              type="button"
              className="text-muted hover:bg-surface hover:text-foreground hidden h-10 w-10 items-center justify-center rounded-2xl sm:flex"
              aria-label="Уведомления"
            >
              <BellIcon />
            </button>
            <div
              className="bg-accent-soft text-accent-strong hidden h-9 w-9 items-center justify-center rounded-full text-xs font-semibold sm:flex"
              aria-hidden
            >
              Вы
            </div>
            <Link
              href="/login"
              className="text-muted hover:text-foreground rounded-xl px-2 py-2 text-sm font-medium sm:px-3"
            >
              Вход
            </Link>
            <Link
              href="/register"
              className="bg-surface text-foreground border-accent-soft/80 rounded-2xl border px-2 py-2 text-sm font-semibold shadow-sm transition-colors hover:border-purple-300 sm:px-3"
            >
              Регистрация
            </Link>
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Z" fill="currentColor" />
      <path
        d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
