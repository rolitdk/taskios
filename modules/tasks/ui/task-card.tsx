"use client";

import {
  DeleteActionButton,
  EditActionButton,
} from "@/components/ui/card-action-buttons";
import type { BoardTask } from "@/modules/board/model/board-types";
import { getTagBadgeClass } from "@/modules/tasks/ui/tag-tones";
import { AVATAR_TONE_CLASSES } from "@/modules/tasks/lib/task-avatar";
import { useDeleteTask } from "@/modules/tasks/hooks/use-delete-task";

type TaskCardProps = {
  task: BoardTask;
  showDelete?: boolean;
  highlighted?: boolean;
  onEdit?: () => void;
};

export function TaskCard({
  task,
  showDelete = true,
  highlighted = false,
  onEdit,
}: TaskCardProps) {
  const { deleteTask } = useDeleteTask();
  const showActions = showDelete || onEdit;

  return (
    <article
      className={`bg-surface relative flex cursor-grab gap-3 rounded-2xl p-3 pr-14 shadow-sm active:cursor-grabbing ${
        highlighted
          ? "ring-accent-strong animate-task-highlight shadow-md ring-2 ring-offset-2 ring-offset-column-bg"
          : "ring-1 ring-black/5"
      }`}
    >
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
                  className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getTagBadgeClass(tag.tone)}`}
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
