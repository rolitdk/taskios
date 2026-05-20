"use client";

import { usePathname } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { GlobalSearch } from "@/components/taskios/global-search";

export function AppShellSearchSlot() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

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
