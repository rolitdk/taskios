import { notFound } from "next/navigation";

import { AppShell } from "@/components/taskios/app-shell";
import { BoardPageClient } from "@/components/taskios/board-page-client";
import { getBoardMeta } from "@/lib/board-catalog";

type BoardPageProps = {
  params: Promise<{ boardId: string }>;
};

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;
  const board = getBoardMeta(boardId);

  if (!board) {
    notFound();
  }

  return (
    <AppShell>
      <BoardPageClient boardId={boardId} />
    </AppShell>
  );
}
