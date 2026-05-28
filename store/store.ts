import { configureStore } from "@reduxjs/toolkit";
import type { Reducer, UnknownAction } from "@reduxjs/toolkit";

import { tasksReducer } from "@/modules/tasks/model/tasks-slice";
import type { TasksState } from "@/modules/tasks/model/tasks-slice";

export type RootState = {
  tasks: TasksState;
};

type PreloadedRootState = Partial<RootState>;

export function makeStore(preloadedState?: PreloadedRootState) {
  return configureStore({
    reducer: {
      tasks: tasksReducer as unknown as Reducer<
        TasksState,
        UnknownAction,
        TasksState | undefined
      >,
    },
    preloadedState,
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
