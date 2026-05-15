// Карточка задачи
import type { BoardTask, TaskTag } from "@/lib/board-types";

const tagToneClass: Record<TaskTag["tone"], string> = {
  pink: "bg-pink-100 text-pink-800 ring-1 ring-pink-200/60",
  purple: "bg-purple-100 text-purple-800 ring-1 ring-purple-200/60",
  mint: "bg-teal-100 text-teal-800 ring-1 ring-teal-200/60",
};

type TaskCardProps = {
  task: BoardTask;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="bg-surface flex cursor-grab gap-3 rounded-2xl p-3 shadow-sm ring-1 ring-black/5 active:cursor-grabbing">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${task.avatarClass}`}
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
