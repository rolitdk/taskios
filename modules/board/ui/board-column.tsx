"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";

import type {
  BoardColumn as BoardColumnType,
  BoardTask,
  TaskStatus,
} from "@/modules/board/model/board-types";
import { useClearColumnTasks } from "@/modules/tasks/hooks/use-clear-column-tasks";

import { TaskModal } from "../../tasks/ui/task-modal";
import { SortableTaskCard } from "../../tasks/ui/sortable-task-card";

type BoardColumnProps = {
  boardId: string;
  column: BoardColumnType;
  highlightedTaskId?: string | null;
  onStartCreate: (status: TaskStatus) => void;
  onEditTask: (task: BoardTask) => void;
};

export function BoardColumn({
  boardId,
  column,
  highlightedTaskId,
  onStartCreate,
  onEditTask,
}: BoardColumnProps) {
  const { clearColumn, isClearing, error, clearError } = useClearColumnTasks();
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const taskIds = column.tasks.map((task) => task.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [clearColumnOpen, setClearColumnOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isEmpty = column.tasks.length === 0;

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  const openClearColumnModal = () => {
    setMenuOpen(false);
    clearError();
    setClearColumnOpen(true);
  };

  const closeClearColumnModal = () => {
    clearError();
    setClearColumnOpen(false);
  };

  const confirmClearColumn = async () => {
    const cleared = await clearColumn(boardId, column.id);
    if (cleared) {
      closeClearColumnModal();
    }
  };

  return (
    <section
      ref={setNodeRef}
      className={`bg-column-bg flex w-80 shrink-0 flex-col rounded-2xl p-3 ring-1 transition-shadow ${
        isOver ? "ring-accent-strong/60 shadow-md ring-2" : "ring-purple-200/40"
      }`}
    >
      <header className="mb-3 flex items-center justify-between gap-2 px-0.5">
        <h2 className="text-foreground text-sm font-semibold">
          {column.title}
          <span className="text-muted ml-1.5 text-xs font-medium">
            {column.tasks.length}
          </span>
        </h2>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="text-muted hover:text-foreground hover:bg-surface/60 flex h-8 w-8 items-center justify-center rounded-xl text-lg leading-none transition-colors"
            aria-label="Меню колонки"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            ···
          </button>
          {menuOpen ? (
            <div
              role="menu"
              className="border-accent-soft/80 absolute top-full right-0 z-10 mt-1 min-w-44 overflow-hidden rounded-xl border bg-white py-1 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={openClearColumnModal}
                disabled={isEmpty}
                className="text-foreground hover:bg-column-bg disabled:text-muted w-full px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                Удалить все задачи
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <ul className="flex min-h-[4rem] flex-1 flex-col gap-2 overflow-y-auto">
          {isEmpty ? (
            <li className="text-muted flex flex-1 items-center justify-center px-2 py-6 text-center text-sm">
              Здесь пока нет задач
            </li>
          ) : (
            column.tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                boardId={boardId}
                task={task}
                highlighted={task.id === highlightedTaskId}
                onEdit={onEditTask}
              />
            ))
          )}
        </ul>
      </SortableContext>

      <button
        type="button"
        onClick={() => onStartCreate(column.id)}
        className="text-muted hover:text-foreground border-accent-soft/80 mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed bg-white/40 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/70"
      >
        <span className="text-lg leading-none">+</span>
        Добавить задачу
      </button>

      <TaskModal
        open={clearColumnOpen}
        onClose={closeClearColumnModal}
        title="Очистка колонки"
      >
        <div className="bg-surface space-y-4 rounded-2xl p-3 shadow-sm ring-1 ring-black/5">
          <p className="text-foreground text-sm leading-relaxed">
            Вы уверены, что хотите удалить все задачи в колонке «{column.title}»?
          </p>
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmClearColumn}
              disabled={isClearing}
              className="bg-accent hover:bg-accent-strong flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60"
            >
              Удалить
            </button>
            <button
              type="button"
              onClick={closeClearColumnModal}
              className="text-muted hover:text-foreground border-accent-soft/80 rounded-xl border bg-white/60 px-3 py-2 text-sm font-medium transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      </TaskModal>
    </section>
  );
}
