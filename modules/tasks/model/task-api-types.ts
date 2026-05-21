import type { TaskPriority, TaskStatus } from "@/modules/board/model/board-types";

export type TaskDto = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
};

export type TasksListResponse = {
  tasks: TaskDto[];
};
