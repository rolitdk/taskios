"use client";
// Карточка задачи

import type { BoardTask, TaskTag } from "@/lib/board-types";
import { AVATAR_TONE_CLASSES } from "@/lib/task-avatar";
import { useDeleteTask } from "@/hooks/use-delete-task";

const tagToneClass: Record<TaskTag["tone"], string> = {
  pink: "bg-pink-100 text-pink-800 ring-1 ring-pink-200/60",
  purple: "bg-purple-100 text-purple-800 ring-1 ring-purple-200/60",
  mint: "bg-teal-100 text-teal-800 ring-1 ring-teal-200/60",
};

type TaskCardProps = {
  task: BoardTask;
  showDelete?: boolean;
};

export function TaskCard({ task, showDelete = true }: TaskCardProps) {
  const { deleteTask } = useDeleteTask();

  return (
    <article className="bg-surface relative flex cursor-grab gap-3 rounded-2xl p-3 pr-8 shadow-sm ring-1 ring-black/5 active:cursor-grabbing">
      {showDelete ? (
        <button
          type="button"
          onClick={() => deleteTask(task.id)}
          onPointerDown={(event) => event.stopPropagation()}
          className="text-muted hover:text-foreground hover:bg-column-bg absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-md text-xs leading-none transition-colors"
          aria-label={`Удалить задачу «${task.title}»`}
        >
          ×
        </button>
      ) : null}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${AVATAR_TONE_CLASSES[task.avatarTone]}`}
        aria-hidden
      >
        {task.initials}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <h3 className="text-foreground text-sm leading-snug font-semibold">
            {task.title}
          </h3>
          <p className="text-muted mt-0.5 text-xs">{task.subtitle}</p>
        </div>
        {task.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {task.tags.map((tag) => (
              <li key={tag.label}>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${tagToneClass[tag.tone]}`}
                >
                  {tag.label}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
