"use client";
// Одна колонка доски задач

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type {
  BoardColumn as BoardColumnType,
  TaskStatus,
} from "@/lib/board-types";

import { CreateTaskForm } from "./create-task-form";
import { SortableTaskCard } from "./sortable-task-card";

type BoardColumnProps = {
  column: BoardColumnType;
  isCreating: boolean;
  onStartCreate: (status: TaskStatus) => void;
  onCancelCreate: () => void;
};

export function BoardColumn({
  column,
  isCreating,
  onStartCreate,
  onCancelCreate,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const taskIds = column.tasks.map((task) => task.id);

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
        <button
          type="button"
          className="text-muted hover:text-foreground hover:bg-surface/60 flex h-8 w-8 items-center justify-center rounded-xl text-lg leading-none transition-colors"
          aria-label="Меню колонки"
        >
          ···
        </button>
      </header>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <ul className="flex min-h-[4rem] flex-1 flex-col gap-2 overflow-y-auto">
          {column.tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </ul>
      </SortableContext>

      {isCreating ? (
        <div className="mt-3">
          <CreateTaskForm
            defaultStatus={column.id}
            onCancel={onCancelCreate}
            onCreated={onCancelCreate}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onStartCreate(column.id)}
          className="text-muted hover:text-foreground border-accent-soft/80 mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed bg-white/40 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/70"
        >
          <span className="text-lg leading-none">+</span>
          Добавить карточку
        </button>
      )}
    </section>
  );
}
