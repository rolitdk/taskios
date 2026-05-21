import { Suspense } from "react";

import { AppShell } from "@/components/ui/app-shell";
import { BoardsList } from "@/modules/board/ui/boards-list";

export default function BoardsPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <BoardsList />
      </Suspense>
    </AppShell>
  );
}
