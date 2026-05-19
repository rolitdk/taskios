import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { BoardTask, TaskStatus } from "@/lib/board-types";
import { WORK_BOARD_ID } from "@/lib/board-catalog";
import { buildInitialBoardMetas, buildInitialBoards } from "@/lib/mock-boards";
import { buildTaskInitials, pickAvatarTone } from "@/lib/task-avatar";

export type CreateTaskPayload = {
  title: string;
  subtitle: string;
  status: TaskStatus;
};

export type UpdateTaskPayload = {
  taskId: string;
  title: string;
  subtitle: string;
  status: TaskStatus;
};

export type MoveTaskPayload = {
  taskId: string;
  status: TaskStatus;
  order: number;
};

export type BoardMeta = {
  id: string;
  title: string;
};

type TasksState = {
  activeBoardId: string;
  boardMetas: BoardMeta[];
  boards: Record<string, BoardTask[]>;
};

const initialState: TasksState = {
  activeBoardId: WORK_BOARD_ID,
  boardMetas: buildInitialBoardMetas(),
  boards: buildInitialBoards(),
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

function getActiveTasks(state: TasksState): BoardTask[] {
  return state.boards[state.activeBoardId] ?? [];
}

function setActiveTasks(state: TasksState, tasks: BoardTask[]) {
  state.boards[state.activeBoardId] = tasks;
}

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setActiveBoard(state, action: PayloadAction<string>) {
      if (state.boards[action.payload]) {
        state.activeBoardId = action.payload;
      }
    },
    updateBoardTitle(
      state,
      action: PayloadAction<{ boardId: string; title: string }>,
    ) {
      const { boardId, title } = action.payload;
      const meta = state.boardMetas.find((board) => board.id === boardId);
      if (!meta) {
        return;
      }
      meta.title = title.trim();
    },
    removeBoard(state, action: PayloadAction<string>) {
      const boardId = action.payload;
      const exists = state.boardMetas.some((board) => board.id === boardId);
      if (!exists) {
        return;
      }

      state.boardMetas = state.boardMetas.filter((board) => board.id !== boardId);
      delete state.boards[boardId];

      if (state.activeBoardId === boardId) {
        state.activeBoardId =
          state.boardMetas[0]?.id ?? state.activeBoardId;
      }
    },
    moveTask(state, action: PayloadAction<MoveTaskPayload>) {
      const { taskId, status, order } = action.payload;
      setActiveTasks(
        state,
        reorderTasks(getActiveTasks(state), taskId, status, order),
      );
    },
    addTask(state, action: PayloadAction<CreateTaskPayload>) {
      const { title, subtitle, status } = action.payload;
      const tasks = getActiveTasks(state);
      const columnTasks = tasks.filter((task) => task.status === status);
      const nextOrder = columnTasks.length;

      const newTask: BoardTask = {
        id: `t-${crypto.randomUUID()}`,
        title: title.trim(),
        subtitle: subtitle.trim() || "Без описания",
        initials: buildTaskInitials(title),
        avatarTone: pickAvatarTone(tasks.length),
        tags: [],
        status,
        order: nextOrder,
      };

      setActiveTasks(state, [...tasks, newTask]);
    },
    updateTask(state, action: PayloadAction<UpdateTaskPayload>) {
      const { taskId, title, subtitle, status } = action.payload;
      const tasks = getActiveTasks(state);
      const task = tasks.find((item) => item.id === taskId);
      if (!task) {
        return;
      }

      const trimmedTitle = title.trim();
      const trimmedSubtitle = subtitle.trim() || "Без описания";
      const updatedFields = {
        title: trimmedTitle,
        subtitle: trimmedSubtitle,
        initials: buildTaskInitials(trimmedTitle),
      };

      if (task.status === status) {
        Object.assign(task, updatedFields);
        return;
      }

      const nextTasks = tasks.map((item) =>
        item.id === taskId ? { ...item, ...updatedFields } : item,
      );
      const newColumnLength = nextTasks.filter(
        (item) => item.status === status && item.id !== taskId,
      ).length;

      setActiveTasks(
        state,
        reorderTasks(nextTasks, taskId, status, newColumnLength),
      );
    },
    clearColumnTasks(state, action: PayloadAction<TaskStatus>) {
      const status = action.payload;
      setActiveTasks(
        state,
        getActiveTasks(state).filter((task) => task.status !== status),
      );
    },
    removeTask(state, action: PayloadAction<string>) {
      const taskId = action.payload;
      const tasks = getActiveTasks(state);
      const removed = tasks.find((task) => task.id === taskId);
      if (!removed) {
        return;
      }

      const { status } = removed;
      const withoutRemoved = tasks.filter((task) => task.id !== taskId);

      const columnTasks = withoutRemoved
        .filter((task) => task.status === status)
        .sort((a, b) => a.order - b.order);

      const reordered = withoutRemoved.map((item) => {
        const index = columnTasks.findIndex((task) => task.id === item.id);
        if (index >= 0) {
          return { ...item, order: index };
        }
        return item;
      });

      setActiveTasks(state, reordered);
    },
  },
});

export const {
  setActiveBoard,
  updateBoardTitle,
  removeBoard,
  moveTask,
  addTask,
  updateTask,
  removeTask,
  clearColumnTasks,
} = tasksSlice.actions;
export const tasksReducer = tasksSlice.reducer;
