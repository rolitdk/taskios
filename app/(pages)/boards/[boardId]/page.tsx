import { AppShell } from "@/components/taskios/app-shell";
import { BoardPageClient } from "@/components/taskios/board-page-client";

type BoardPageProps = {
  params: Promise<{ boardId: string }>;
};

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;

  return (
    <AppShell>
      <BoardPageClient boardId={boardId} />
    </AppShell>
  );
}
