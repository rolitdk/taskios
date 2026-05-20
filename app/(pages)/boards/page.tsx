import { AppShell } from "@/components/taskios/app-shell";
import { BoardsList } from "@/components/taskios/boards-list";

export default function BoardsPage() {
  return (
    <AppShell>
      <BoardsList />
    </AppShell>
  );
}
