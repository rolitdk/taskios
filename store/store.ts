import { configureStore } from "@reduxjs/toolkit";

import { tasksReducer } from "@/modules/tasks/model/tasks-slice";

export function makeStore(
  preloadedState?: Partial<{
    tasks: ReturnType<typeof tasksReducer>;
  }>,
) {
  return configureStore({
    reducer: {
      tasks: tasksReducer,
    },
    preloadedState,
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
