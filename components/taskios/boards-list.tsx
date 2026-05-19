"use client";

import Link from "next/link";
import { useState } from "react";

import { BoardTitleForm } from "@/components/taskios/board-title-form";
import {
  DeleteActionButton,
  EditActionButton,
} from "@/components/taskios/card-action-buttons";
import { TaskModal } from "@/components/taskios/task-modal";
import type { BoardCatalogMeta } from "@/lib/board-catalog";
import { useDeleteBoard } from "@/hooks/use-delete-board";
import { useAppSelector } from "@/store/hooks";
import { selectAllBoardMetas } from "@/store/selectors/board-selectors";

type EditBoardState = {
  boardId: string;
  title: string;
};

type DeleteBoardState = {
  boardId: string;
  title: string;
};

export function BoardsList() {
  const boards = useAppSelector(selectAllBoardMetas);
  const { deleteBoard } = useDeleteBoard();
  const [editBoard, setEditBoard] = useState<EditBoardState | null>(null);
  const [deleteBoardState, setDeleteBoardState] =
    useState<DeleteBoardState | null>(null);

  const closeEditModal = () => setEditBoard(null);
  const closeDeleteModal = () => setDeleteBoardState(null);

  const confirmDelete = () => {
    if (!deleteBoardState) {
      return;
    }

    deleteBoard(deleteBoardState.boardId);
    closeDeleteModal();
  };

  const openEdit = (board: BoardCatalogMeta) => {
    setEditBoard({ boardId: board.id, title: board.title });
  };

  const openDelete = (board: BoardCatalogMeta) => {
    setDeleteBoardState({ boardId: board.id, title: board.title });
  };

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
      <header>
        <p className="text-muted text-xs font-medium tracking-wide uppercase">
          Рабочее пространство
        </p>
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Мои доски
        </h1>
      </header>
      <ul
        className="flex [scrollbar-width:thin] gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none]"
        role="list"
        aria-label="Список досок"
      >
        {boards.map((board) => (
          <li key={board.id} className="shrink-0">
            <article className="bg-column-bg hover:ring-accent-strong/60 flex w-80 flex-col rounded-2xl p-3 ring-1 ring-purple-200/40 transition-shadow hover:shadow-md">
              <div className="relative mb-3 pr-12">
                <div className="absolute top-0 right-0 flex items-center gap-0.5">
                  <EditActionButton
                    onClick={() => openEdit(board)}
                    aria-label={`Редактировать доску «${board.title}»`}
                  />
                  <DeleteActionButton
                    onClick={() => openDelete(board)}
                    aria-label={`Удалить доску «${board.title}»`}
                  />
                </div>
                <h2 className="text-foreground px-0.5 text-sm font-semibold">
                  {board.title}
                </h2>
              </div>
              <Link
                href={board.href}
                className="text-muted border-accent-soft/80 mt-auto flex min-h-16 items-center justify-center rounded-xl border border-dashed bg-white/40 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-accent-strong/60 focus-visible:outline-none"
              >
                Открыть доску
              </Link>
            </article>
          </li>
        ))}
      </ul>

      <TaskModal
        open={editBoard !== null}
        onClose={closeEditModal}
        title="Редактирование доски"
      >
        {editBoard ? (
          <BoardTitleForm
            key={editBoard.boardId}
            boardId={editBoard.boardId}
            defaultTitle={editBoard.title}
            onCancel={closeEditModal}
            onSaved={closeEditModal}
          />
        ) : null}
      </TaskModal>

      <TaskModal
        open={deleteBoardState !== null}
        onClose={closeDeleteModal}
        title="Удаление доски"
      >
        {deleteBoardState ? (
          <div className="bg-surface space-y-4 rounded-2xl p-3 shadow-sm ring-1 ring-black/5">
            <p className="text-foreground text-sm leading-relaxed">
              Вы уверены, что хотите удалить доску?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmDelete}
                className="bg-accent hover:bg-accent-strong flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-white transition-colors"
              >
                Удалить
              </button>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="text-muted hover:text-foreground border-accent-soft/80 rounded-xl border bg-white/60 px-3 py-2 text-sm font-medium transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : null}
      </TaskModal>
    </main>
  );
}
