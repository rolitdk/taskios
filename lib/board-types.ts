// Типы для доски задач

export type TaskTag = {
  label: string;
  tone: "pink" | "purple" | "mint";
};

export type TaskStatus = "todo" | "doing" | "review" | "done";

export type BoardTask = {
  id: string;
  title: string;
  subtitle: string;
  initials: string;
  avatarClass: string;
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
