import Link from "next/link";

import { AppShellCreateBoardButton } from "@/components/ui/app-shell-create-board-button";
import { AppShellFooter } from "@/components/ui/app-shell-footer";
import { AppShellSearchSlot } from "@/components/ui/app-shell-search-slot";
import { AppShellNotifications } from "@/components/ui/app-shell-notifications";
import { AppShellUserMenu } from "@/components/ui/app-shell-user-menu";

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
            <AppShellCreateBoardButton />
            <AppShellNotifications />
            <AppShellUserMenu />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
      <AppShellFooter />
    </div>
  );
}
