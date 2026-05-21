"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/modules/user/providers/auth-provider";
import { BoardTitleForm } from "@/modules/board/ui/board-title-form";
import { CreateBoardForm } from "@/modules/board/ui/create-board-form";
import {
  DeleteActionButton,
  EditActionButton,
} from "@/components/ui/card-action-buttons";
import { TaskModal } from "@/modules/tasks/ui/task-modal";
import type { BoardCatalogMeta } from "@/modules/board/model/board-catalog";
import { useDeleteBoard } from "@/modules/board/hooks/use-delete-board";
import { useLoadBoards } from "@/modules/board/hooks/use-load-boards";
import { useAppSelector } from "@/store/hooks";
import { selectAllBoardMetas } from "@/modules/board/store/board-selectors";

type EditBoardState = {
  boardId: string;
  title: string;
};

type DeleteBoardState = {
  boardId: string;
  title: string;
};

const BOARDS_CREATE_QUERY = "create";

export function BoardsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const boards = useAppSelector(selectAllBoardMetas);
  const { isLoading: isBoardsLoading, error: boardsLoadError } = useLoadBoards();
  const { deleteBoard, isDeleting, error: deleteError, clearError } =
    useDeleteBoard();
  const createOpen = searchParams.get(BOARDS_CREATE_QUERY) === "1";
  const [editBoard, setEditBoard] = useState<EditBoardState | null>(null);
  const [deleteBoardState, setDeleteBoardState] =
    useState<DeleteBoardState | null>(null);

  const closeCreateModal = () => {
    if (createOpen) {
      router.replace("/boards");
    }
  };

  const closeEditModal = () => setEditBoard(null);
  const closeDeleteModal = () => {
    clearError();
    setDeleteBoardState(null);
  };

  useEffect(() => {
    if (!deleteBoardState) {
      clearError();
    }
  }, [deleteBoardState, clearError]);

  const confirmDelete = async () => {
    if (!deleteBoardState) {
      return;
    }

    const deleted = await deleteBoard(deleteBoardState.boardId);
    if (deleted) {
      closeDeleteModal();
    }
  };

  const openEdit = (board: BoardCatalogMeta) => {
    setEditBoard({ boardId: board.id, title: board.title });
  };

  const openDelete = (board: BoardCatalogMeta) => {
    setDeleteBoardState({ boardId: board.id, title: board.title });
  };

  const openCreate = () => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    router.push(`/boards?${BOARDS_CREATE_QUERY}=1`);
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
        {boardsLoadError ? (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {boardsLoadError}
          </p>
        ) : null}
      </header>
      {isBoardsLoading ? (
        <p className="text-muted text-sm">Загрузка досок…</p>
      ) : null}
      <ul
        className="flex flex-wrap gap-4"
        role="list"
        aria-label="Список досок"
      >
        {boards.map((board) => (
          <li key={board.id}>
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
        <li>
          <button
            type="button"
            onClick={openCreate}
            disabled={isLoading}
            className="bg-column-bg hover:ring-accent-strong/60 border-accent-soft/80 text-muted hover:text-foreground flex w-80 flex-col rounded-2xl border-2 border-dashed p-3 ring-1 ring-purple-200/40 transition-shadow hover:bg-white/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-accent-strong/60 focus-visible:outline-none disabled:opacity-60"
            aria-label="Создать новую доску"
          >
            <span className="mb-3 block min-h-5" aria-hidden />
            <span className="border-accent-soft/80 mt-auto flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed bg-white/40 px-3 py-2 transition-colors">
              <span
                className="text-accent-strong text-2xl leading-none font-light"
                aria-hidden
              >
                +
              </span>
              <span className="text-sm font-medium">Создать новую доску</span>
            </span>
          </button>
        </li>
      </ul>

      <TaskModal
        open={createOpen}
        onClose={closeCreateModal}
        title="Новая доска"
      >
        <CreateBoardForm
          onCancel={closeCreateModal}
          onCreated={closeCreateModal}
        />
      </TaskModal>

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
              Вы уверены, что хотите удалить доску «{deleteBoardState.title}»?
            </p>
            {deleteError ? (
              <p className="text-sm text-red-600" role="alert">
                {deleteError}
              </p>
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-accent hover:bg-accent-strong flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
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
