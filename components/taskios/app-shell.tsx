import Link from "next/link";

import { AppShellFooter } from "@/components/taskios/app-shell-footer";
import { AppShellSearchSlot } from "@/components/taskios/app-shell-search-slot";
import { AppShellUserMenu } from "@/components/taskios/app-shell-user-menu";

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

          <AppShellSearchSlot />

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
            <AppShellUserMenu />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      <AppShellFooter />
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
