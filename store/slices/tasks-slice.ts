import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { BoardTask, TaskStatus } from "@/lib/board-types";
import { initialTasks } from "@/lib/mock-board";
import { buildTaskInitials, pickAvatarTone } from "@/lib/task-avatar";

export type CreateTaskPayload = {
  title: string;
  subtitle: string;
  status: TaskStatus;
};

export type MoveTaskPayload = {
  taskId: string;
  status: TaskStatus;
  order: number;
};

type TasksState = {
  tasks: BoardTask[];
};

const initialState: TasksState = {
  tasks: initialTasks,
};

function reorderTasks(
  tasks: BoardTask[],
  taskId: string,
  status: TaskStatus,
  order: number,
): BoardTask[] {
  const moving = tasks.find((task) => task.id === taskId);
  if (!moving) {
    return tasks;
  }

  const withoutMoving = tasks.filter((task) => task.id !== taskId);
  const columnTasks = withoutMoving
    .filter((task) => task.status === status)
    .sort((a, b) => a.order - b.order);

  columnTasks.splice(order, 0, { ...moving, status, order });

  return withoutMoving
    .filter((task) => task.status !== status)
    .concat(
      columnTasks.map((task, index) => ({
        ...task,
        status,
        order: index,
      })),
    );
}

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    moveTask(state, action: PayloadAction<MoveTaskPayload>) {
      const { taskId, status, order } = action.payload;
      state.tasks = reorderTasks(state.tasks, taskId, status, order);
    },
    addTask(state, action: PayloadAction<CreateTaskPayload>) {
      const { title, subtitle, status } = action.payload;
      const columnTasks = state.tasks.filter((task) => task.status === status);
      const nextOrder = columnTasks.length;

      const newTask: BoardTask = {
        id: `t-${crypto.randomUUID()}`,
        title: title.trim(),
        subtitle: subtitle.trim() || "Без описания",
        initials: buildTaskInitials(title),
        avatarTone: pickAvatarTone(state.tasks.length),
        tags: [],
        status,
        order: nextOrder,
      };

      state.tasks.push(newTask);
    },
  },
});

export const { moveTask, addTask } = tasksSlice.actions;
export const tasksReducer = tasksSlice.reducer;
