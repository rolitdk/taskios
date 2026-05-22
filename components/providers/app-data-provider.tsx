"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useLoadBoards } from "@/modules/board/hooks/use-load-boards";
import { useLoadTasks } from "@/modules/tasks/hooks/use-load-tasks";

type BoardsLoadState = ReturnType<typeof useLoadBoards>;
type TasksLoadState = ReturnType<typeof useLoadTasks>;

type AppDataContextValue = {
  boardsLoad: BoardsLoadState;
  tasksLoad: TasksLoadState;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

type AppDataProviderProps = {
  children: ReactNode;
};

/** Единая точка загрузки досок и задач для всего AppShell. */
export function AppDataProvider({ children }: AppDataProviderProps) {
  const boardsLoad = useLoadBoards();
  const tasksLoad = useLoadTasks({ enabled: boardsLoad.isReady });

  return (
    <AppDataContext.Provider value={{ boardsLoad, tasksLoad }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useBoardsLoad(): BoardsLoadState {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useBoardsLoad must be used within AppDataProvider");
  }
  return context.boardsLoad;
}

export function useTasksLoad(): TasksLoadState {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useTasksLoad must be used within AppDataProvider");
  }
  return context.tasksLoad;
}
