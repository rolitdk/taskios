import { z } from "zod";

import { TAG_TONE_VALUES } from "@/shared/model/task-tag";

export const projectStatusValues = [
  "planned",
  "active",
  "on_hold",
  "completed",
  "cancelled",
] as const;
export const taskStatusValues = ["todo", "doing", "review", "done"] as const;
export const taskPriorityValues = ["low", "medium", "high", "urgent"] as const;

const isoDate = z
  .string()
  .datetime({ offset: true })
  .or(z.string().datetime())
  .transform((value) => new Date(value));

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createBoardSchema = z.object({
  title: z.string().trim().min(2).max(180),
});

export const updateBoardSchema = createBoardSchema;

export const createProjectSchema = z.object({
  clientId: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().min(1).max(2000),
  status: z.enum(projectStatusValues),
  budget: z.coerce.number().min(0),
  deadline: isoDate,
});

export const updateProjectSchema = createProjectSchema.partial();

export const taskTagSchema = z.object({
  label: z.string().trim().min(1).max(40),
  tone: z.enum(TAG_TONE_VALUES),
});

export const taskTagsSchema = z.array(taskTagSchema).max(32);

export const createTaskSchema = z.object({
  projectId: z.string().trim().min(1),
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().min(1).max(2000),
  status: z.enum(taskStatusValues),
  priority: z.enum(taskPriorityValues),
  dueDate: isoDate,
  tags: taskTagsSchema.default([]),
});

export const updateTaskSchema = createTaskSchema
  .omit({ projectId: true })
  .partial();

export const createCommentSchema = z.object({
  text: z.string().trim().min(1).max(1500),
});

export const updateCommentSchema = createCommentSchema.partial();

export function formatZodErrorMessage(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  if (!firstIssue) {
    return "Неверные входные данные";
  }

  const path = firstIssue.path.length ? `${firstIssue.path.join(".")}: ` : "";
  return `${path}${firstIssue.message}`;
}
