import type { TaskPriority, TaskStatus } from "@/modules/board/model/board-types";
import type { TaskTagRecord } from "@/shared/model/task-tag";

export type TaskDto = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  tags: TaskTagRecord[];
};

export type TasksListResponse = {
  tasks: TaskDto[];
};

export type CreateTaskRequest = {
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  tags: TaskTagRecord[];
};

export type CreateTaskResponse = {
  task: TaskDto;
};

export type UpdateTaskRequest = Partial<
  Omit<CreateTaskRequest, "projectId">
>;

export type UpdateTaskResponse = {
  task: TaskDto;
};
