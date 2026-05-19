"use client";

import { usePathname } from "next/navigation";

import { GlobalSearch } from "@/components/taskios/global-search";

export function AppShellSearchSlot() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <div className="hidden min-w-0 flex-1 md:block">
      <GlobalSearch />
    </div>
  );
}
