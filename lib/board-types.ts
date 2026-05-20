import type { TagTone } from "@/lib/tag-tones";

export type TaskTag = {
  label: string;
  tone: TagTone;
};

export type AvatarTone = "soft" | "muted" | "shell" | "accent" | "column";

export type TaskStatus = "todo" | "doing" | "review" | "done";

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
