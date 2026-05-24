import { Suspense } from "react";

import { BoardPageClient } from "@/modules/board/ui/board-page-client";

type BoardPageProps = {
  params: Promise<{ boardId: string }>;
};

export default async function BoardPage({ params }: BoardPageProps) {
  const { boardId } = await params;

  return (
    <Suspense fallback={null}>
      <BoardPageClient boardId={boardId} />
    </Suspense>
  );
}
