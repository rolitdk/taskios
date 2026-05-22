import type { Task } from "@prisma/client";

import type { TaskTagRecord } from "@/shared/model/task-tag";
import { parseTaskTagsFromJson } from "@/shared/server/task-tags";

export type PublicTask = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: Task["status"];
  priority: Task["priority"];
  dueDate: string;
  sortOrder: number;
  tags: TaskTagRecord[];
};

export function toPublicTask(task: Task): PublicTask {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate.toISOString(),
    sortOrder: task.sortOrder,
    tags: parseTaskTagsFromJson(task.tags),
  };
}
