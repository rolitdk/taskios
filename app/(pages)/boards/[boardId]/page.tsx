import { Suspense } from "react";

import { AppShell } from "@/components/ui/app-shell";
import { BoardPageClient } from "@/modules/board/ui/board-page-client";

type BoardPageProps = {
  params: Promise<{ boardId: string }>;
};

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;

  return (
    <AppShell>
      <Suspense fallback={null}>
        <BoardPageClient boardId={boardId} />
      </Suspense>
    </AppShell>
  );
}
