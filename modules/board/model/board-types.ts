import type { TagTone, TaskTagRecord } from "@/shared/model/task-tag";

export type TaskTag = TaskTagRecord;
export type { TagTone };

export type AvatarTone = "soft" | "muted" | "shell" | "accent" | "column";

export type TaskStatus = "todo" | "doing" | "review" | "done";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type BoardTask = {
  id: string;
  title: string;
  subtitle: string;
  initials: string;
  avatarTone: AvatarTone;
  tags: TaskTag[];
  status: TaskStatus;
  order: number;
};

export type ColumnDefinition = {
  id: TaskStatus;
  title: string;
};

export type BoardColumn = ColumnDefinition & {
  tasks: BoardTask[];
};

export const COLUMN_DEFINITIONS: ColumnDefinition[] = [
  { id: "todo", title: "К выполнению" },
  { id: "doing", title: "В работе" },
  { id: "review", title: "На проверке" },
  { id: "done", title: "Готово" },
];
