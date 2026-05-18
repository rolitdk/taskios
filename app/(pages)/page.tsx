import { AppShell } from "@/components/taskios/app-shell";
import { BoardPageClient } from "@/components/taskios/board-page-client";
import { WORK_BOARD_ID } from "@/lib/board-catalog";

export default function HomePage() {
  return (
    <AppShell>
      <BoardPageClient boardId={WORK_BOARD_ID} />
    </AppShell>
  );
}
