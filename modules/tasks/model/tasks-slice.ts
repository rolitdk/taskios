import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { BoardTask, TaskStatus, TaskTag } from "@/modules/board/model/board-types";
import { buildTaskInitials, pickAvatarTone } from "@/modules/tasks/lib/task-avatar";

export type CreateTaskPayload = {
  boardId?: string;
  id?: string;
  title: string;
  subtitle: string;
  status: TaskStatus;
  tags: TaskTag[];
};

export type UpdateTaskPayload = {
  taskId: string;
  title: string;
  subtitle: string;
  status: TaskStatus;
  tags: TaskTag[];
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
  activeBoardId: "",
  boardMetas: [],
  boards: {},
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

function getBoardTasks(state: TasksState, boardId: string): BoardTask[] {
  return state.boards[boardId] ?? [];
}

function setBoardTasks(
  state: TasksState,
  boardId: string,
  tasks: BoardTask[],
) {
  state.boards[boardId] = tasks;
}

function getActiveTasks(state: TasksState): BoardTask[] {
  return getBoardTasks(state, state.activeBoardId);
}

function setActiveTasks(state: TasksState, tasks: BoardTask[]) {
  setBoardTasks(state, state.activeBoardId, tasks);
}

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setActiveBoard(state, action: PayloadAction<string>) {
      if (state.boardMetas.some((board) => board.id === action.payload)) {
        state.activeBoardId = action.payload;
      }
    },
    setBoardCatalog(state, action: PayloadAction<BoardMeta[]>) {
      state.boardMetas = action.payload;
      state.boards = Object.fromEntries(
        action.payload.map((meta) => [meta.id, state.boards[meta.id] ?? []]),
      );

      if (
        state.activeBoardId &&
        !action.payload.some((board) => board.id === state.activeBoardId)
      ) {
        state.activeBoardId = action.payload[0]?.id ?? "";
      }
    },
    setAllBoardTasks(
      state,
      action: PayloadAction<Record<string, BoardTask[]>>,
    ) {
      for (const meta of state.boardMetas) {
        state.boards[meta.id] = action.payload[meta.id] ?? [];
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
    addBoard(state, action: PayloadAction<BoardMeta>) {
      const { id, title } = action.payload;
      const trimmedTitle = title.trim();
      if (trimmedTitle.length < 2) {
        return;
      }

      if (state.boardMetas.some((board) => board.id === id)) {
        return;
      }

      state.boardMetas.push({ id, title: trimmedTitle });
      state.boards[id] = [];
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
      const { boardId, id, title, subtitle, status, tags } = action.payload;
      const targetBoardId = boardId ?? state.activeBoardId;
      if (!targetBoardId) {
        return;
      }

      const tasks = getBoardTasks(state, targetBoardId);
      const columnTasks = tasks.filter((task) => task.status === status);
      const nextOrder = columnTasks.length;

      const newTask: BoardTask = {
        id: id ?? `t-${crypto.randomUUID()}`,
        title: title.trim(),
        subtitle: subtitle.trim() || "Без описания",
        initials: buildTaskInitials(title),
        avatarTone: pickAvatarTone(tasks.length),
        tags,
        status,
        order: nextOrder,
      };

      setBoardTasks(state, targetBoardId, [...tasks, newTask]);
    },
    updateTask(state, action: PayloadAction<UpdateTaskPayload>) {
      const { taskId, title, subtitle, status, tags } = action.payload;
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
        tags,
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
  setBoardCatalog,
  setAllBoardTasks,
  addBoard,
  updateBoardTitle,
  removeBoard,
  moveTask,
  addTask,
  updateTask,
  removeTask,
  clearColumnTasks,
} = tasksSlice.actions;
export const tasksReducer = tasksSlice.reducer;
