"use client";

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
  onEdit?: () => void;
};

function PencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TaskCard({ task, showDelete = true, onEdit }: TaskCardProps) {
  const { deleteTask } = useDeleteTask();
  const showActions = showDelete || onEdit;

  return (
    <article className="bg-surface relative flex cursor-grab gap-3 rounded-2xl p-3 pr-14 shadow-sm ring-1 ring-black/5 active:cursor-grabbing">
      {showActions ? (
        <div className="absolute top-2 right-2 flex items-center gap-0.5">
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              onPointerDown={(event) => event.stopPropagation()}
              className="text-muted hover:text-foreground hover:bg-column-bg flex h-5 w-5 items-center justify-center rounded-md transition-colors"
              aria-label={`Редактировать задачу «${task.title}»`}
            >
              <PencilIcon />
            </button>
          ) : null}
          {showDelete ? (
            <button
              type="button"
              onClick={() => deleteTask(task.id)}
              onPointerDown={(event) => event.stopPropagation()}
              className="text-muted hover:text-foreground hover:bg-column-bg flex h-5 w-5 items-center justify-center rounded-md text-xs leading-none transition-colors"
              aria-label={`Удалить задачу «${task.title}»`}
            >
              ×
            </button>
          ) : null}
        </div>
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
