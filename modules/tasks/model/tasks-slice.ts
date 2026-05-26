import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  BoardTask,
  TaskStatus,
  TaskTag,
} from "@/modules/board/model/board-types";
import {
  buildTaskInitials,
  pickAvatarTone,
} from "@/modules/tasks/lib/task-avatar";

export type CreateTaskPayload = {
  boardId?: string;
  id?: string;
  title: string;
  subtitle: string;
  status: TaskStatus;
  tags: TaskTag[];
  order?: number;
};

export type UpdateTaskPayload = {
  boardId: string;
  taskId: string;
  title: string;
  subtitle: string;
  status: TaskStatus;
  tags: TaskTag[];
};

export type MoveTaskPayload = {
  boardId: string;
  taskId: string;
  status: TaskStatus;
  order: number;
};

export type ClearColumnTasksPayload = {
  boardId: string;
  status: TaskStatus;
};

export type RemoveTaskPayload = {
  boardId: string;
  taskId: string;
};

export type BoardCatalogEntry = {
  id: string;
  title: string;
};

type TasksState = {
  activeBoardId: string;
  boardCatalog: BoardCatalogEntry[];
  boards: Record<string, BoardTask[]>;
  /** Ключ id досок каталога, синхронизированного с API; null — ещё не загружали */
  boardCatalogIdsKey: string | null;
  /** Ключ id досок, для которых tasks уже синхронизированы с API; null — ещё не загружали */
  loadedBoardIdsKey: string | null;
};

const initialState: TasksState = {
  activeBoardId: "",
  boardCatalog: [],
  boards: {},
  boardCatalogIdsKey: null,
  loadedBoardIdsKey: null,
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

function setBoardTasks(state: TasksState, boardId: string, tasks: BoardTask[]) {
  state.boards[boardId] = tasks;
}

function resolveBoardId(state: TasksState, boardId: string): string | null {
  if (!boardId || !(boardId in state.boards)) {
    return null;
  }

  return boardId;
}

function buildBoardIdsKey(catalog: BoardCatalogEntry[]): string {
  return catalog.map((board) => board.id).join(",");
}

/** Сохраняет локальную синхронизацию задач после add/remove доски без refetch. */
function syncLoadedBoardIdsKey(state: TasksState) {
  if (state.loadedBoardIdsKey === null) {
    return;
  }

  state.loadedBoardIdsKey =
    state.boardCatalog.length === 0
      ? null
      : buildBoardIdsKey(state.boardCatalog);
}

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setActiveBoard(state, action: PayloadAction<string>) {
      if (state.boardCatalog.some((board) => board.id === action.payload)) {
        state.activeBoardId = action.payload;
      }
    },
    setBoardCatalog(state, action: PayloadAction<BoardCatalogEntry[]>) {
      state.boardCatalog = action.payload;
      state.boards = Object.fromEntries(
        action.payload.map((entry) => [entry.id, state.boards[entry.id] ?? []]),
      );
      state.boardCatalogIdsKey = action.payload
        .map((board) => board.id)
        .join(",");

      if (action.payload.length === 0) {
        state.loadedBoardIdsKey = null;
      }

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
      for (const entry of state.boardCatalog) {
        state.boards[entry.id] = action.payload[entry.id] ?? [];
      }
      state.loadedBoardIdsKey = state.boardCatalog
        .map((board) => board.id)
        .join(",");
    },
    setBoardTasksFromApi(
      state,
      action: PayloadAction<{ boardId: string; tasks: BoardTask[] }>,
    ) {
      const { boardId, tasks } = action.payload;
      state.boards[boardId] = tasks;
      state.loadedBoardIdsKey = boardId;
    },
    setBoardCatalogIdsKey(state, action: PayloadAction<string | null>) {
      state.boardCatalogIdsKey = action.payload;
    },
    setLoadedBoardIdsKey(state, action: PayloadAction<string | null>) {
      state.loadedBoardIdsKey = action.payload;
    },
    updateBoardTitle(
      state,
      action: PayloadAction<{ boardId: string; title: string }>,
    ) {
      const { boardId, title } = action.payload;
      const entry = state.boardCatalog.find((board) => board.id === boardId);
      if (!entry) {
        return;
      }
      entry.title = title.trim();
    },
    addBoard(state, action: PayloadAction<BoardCatalogEntry>) {
      const { id, title } = action.payload;
      const trimmedTitle = title.trim();
      if (trimmedTitle.length < 2) {
        return;
      }

      if (state.boardCatalog.some((board) => board.id === id)) {
        return;
      }

      state.boardCatalog.push({ id, title: trimmedTitle });
      state.boards[id] = [];
      syncLoadedBoardIdsKey(state);
    },
    removeBoard(state, action: PayloadAction<string>) {
      const boardId = action.payload;
      const exists = state.boardCatalog.some((board) => board.id === boardId);
      if (!exists) {
        return;
      }

      state.boardCatalog = state.boardCatalog.filter(
        (board) => board.id !== boardId,
      );
      delete state.boards[boardId];

      if (state.activeBoardId === boardId) {
        state.activeBoardId = state.boardCatalog[0]?.id ?? state.activeBoardId;
      }

      syncLoadedBoardIdsKey(state);
    },
    moveTask(state, action: PayloadAction<MoveTaskPayload>) {
      const { boardId, taskId, status, order } = action.payload;
      const resolvedBoardId = resolveBoardId(state, boardId);
      if (!resolvedBoardId) {
        return;
      }

      setBoardTasks(
        state,
        resolvedBoardId,
        reorderTasks(
          getBoardTasks(state, resolvedBoardId),
          taskId,
          status,
          order,
        ),
      );
    },
    addTask(state, action: PayloadAction<CreateTaskPayload>) {
      const { boardId, id, title, subtitle, status, tags, order } =
        action.payload;
      const targetBoardId = boardId ?? state.activeBoardId;
      if (!targetBoardId) {
        return;
      }

      const tasks = getBoardTasks(state, targetBoardId);
      const columnTasks = tasks.filter((task) => task.status === status);
      const nextOrder = order ?? columnTasks.length;

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

      setBoardTasks(
        state,
        targetBoardId,
        reorderTasks([...tasks, newTask], newTask.id, status, nextOrder),
      );
    },
    updateTask(state, action: PayloadAction<UpdateTaskPayload>) {
      const { boardId, taskId, title, subtitle, status, tags } = action.payload;
      const resolvedBoardId = resolveBoardId(state, boardId);
      if (!resolvedBoardId) {
        return;
      }

      const tasks = getBoardTasks(state, resolvedBoardId);
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
        setBoardTasks(
          state,
          resolvedBoardId,
          tasks.map((item) =>
            item.id === taskId ? { ...item, ...updatedFields } : item,
          ),
        );
        return;
      }

      const nextTasks = tasks.map((item) =>
        item.id === taskId ? { ...item, ...updatedFields } : item,
      );
      const newColumnLength = nextTasks.filter(
        (item) => item.status === status && item.id !== taskId,
      ).length;

      setBoardTasks(
        state,
        resolvedBoardId,
        reorderTasks(nextTasks, taskId, status, newColumnLength),
      );
    },
    clearColumnTasks(state, action: PayloadAction<ClearColumnTasksPayload>) {
      const { boardId, status } = action.payload;
      const resolvedBoardId = resolveBoardId(state, boardId);
      if (!resolvedBoardId) {
        return;
      }

      setBoardTasks(
        state,
        resolvedBoardId,
        getBoardTasks(state, resolvedBoardId).filter(
          (task) => task.status !== status,
        ),
      );
    },
    removeTask(state, action: PayloadAction<RemoveTaskPayload>) {
      const { boardId, taskId } = action.payload;
      const resolvedBoardId = resolveBoardId(state, boardId);
      if (!resolvedBoardId) {
        return;
      }

      const tasks = getBoardTasks(state, resolvedBoardId);
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

      setBoardTasks(state, resolvedBoardId, reordered);
    },
  },
});

export const {
  setActiveBoard,
  setBoardCatalog,
  setAllBoardTasks,
  setBoardTasksFromApi,
  setBoardCatalogIdsKey,
  setLoadedBoardIdsKey,
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
