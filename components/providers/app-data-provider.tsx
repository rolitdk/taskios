"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useLoadTasks } from "@/modules/tasks/hooks/use-load-tasks";
import { useAuth } from "@/modules/user/providers/auth-provider";
import { useAppSelector } from "@/store/hooks";

type TasksLoadState = ReturnType<typeof useLoadTasks>;

type AppDataContextValue = {
  tasksLoad: TasksLoadState;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

type AppDataProviderProps = {
  children: ReactNode;
};

/** Загрузка задач для AppShell (после синхронизации каталога досок). */
export function AppDataProvider({ children }: AppDataProviderProps) {
  const { user } = useAuth();
  const boardCatalogIdsKey = useAppSelector(
    (state) => state.tasks.boardCatalogIdsKey,
  );
  const catalogSynced = !user || boardCatalogIdsKey !== null;
  const tasksLoad = useLoadTasks({ enabled: catalogSynced });

  return (
    <AppDataContext.Provider value={{ tasksLoad }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useTasksLoad(): TasksLoadState {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useTasksLoad must be used within AppDataProvider");
  }
  return context.tasksLoad;
}
