import { AppShell } from "@/components/taskios/app-shell";
import { BoardPageClient } from "@/components/taskios/board-page-client";

export default function HomePage() {
  return (
    <AppShell>
      <BoardPageClient />
    </AppShell>
  );
}
