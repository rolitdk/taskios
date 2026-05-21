"use client";

import { usePathname } from "next/navigation";

import { useLoadBoards } from "@/modules/board/hooks/use-load-boards";
import { useLoadTasks } from "@/modules/tasks/hooks/use-load-tasks";
import { GlobalSearch } from "@/modules/tasks/ui/global-search";
import { useAuth } from "@/modules/user/providers/auth-provider";

export function AppShellSearchSlot() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { isReady: isBoardsReady } = useLoadBoards();
  useLoadTasks({ enabled: Boolean(user) && isBoardsReady });

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  if (pathname === "/" && (isLoading || !user)) {
    return null;
  }

  return (
    <div className="hidden min-w-0 flex-1 md:block">
      <GlobalSearch />
    </div>
  );
}
