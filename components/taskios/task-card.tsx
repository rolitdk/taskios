"use client";

import {
  DeleteActionButton,
  EditActionButton,
} from "@/components/taskios/card-action-buttons";
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

export function TaskCard({ task, showDelete = true, onEdit }: TaskCardProps) {
  const { deleteTask } = useDeleteTask();
  const showActions = showDelete || onEdit;

  return (
    <article className="bg-surface relative flex cursor-grab gap-3 rounded-2xl p-3 pr-14 shadow-sm ring-1 ring-black/5 active:cursor-grabbing">
      {showActions ? (
        <div className="absolute top-2 right-2 flex items-center gap-0.5">
          {onEdit ? (
            <EditActionButton
              onClick={onEdit}
              aria-label={`Редактировать задачу «${task.title}»`}
            />
          ) : null}
          {showDelete ? (
            <DeleteActionButton
              onClick={() => deleteTask(task.id)}
              aria-label={`Удалить задачу «${task.title}»`}
            />
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
