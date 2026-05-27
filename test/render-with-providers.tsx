import { DndContext } from "@dnd-kit/core";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { Provider } from "react-redux";

import { makeBoardTask } from "@/modules/tasks/lib/__fixtures__/board-tasks";
import { makeStore, type AppStore, type RootState } from "@/store/store";

type RenderWithProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
  withDndContext?: boolean;
};

function createWrapper(store: AppStore, withDndContext: boolean) {
  return function Wrapper({ children }: { children: ReactNode }) {
    const content = withDndContext ? (
      <DndContext>{children}</DndContext>
    ) : (
      children
    );

    return <Provider store={store}>{content}</Provider>;
  };
}

export function makeTestTasksState(
  overrides: Partial<RootState["tasks"]> = {},
): Partial<RootState> {
  const boardId = overrides.activeBoardId ?? "board-1";

  return {
    tasks: {
      activeBoardId: boardId,
      boardCatalog: [{ id: boardId, title: "Доска" }],
      boards: {
        [boardId]: [makeBoardTask({ id: "task-1", status: "todo", order: 0 })],
      },
      boardCatalogIdsKey: null,
      loadedBoardIdsKey: null,
      ...overrides,
    },
  };
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store: providedStore,
    withDndContext = false,
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  const store = providedStore ?? makeStore(preloadedState);

  return {
    store,
    ...render(ui, {
      wrapper: createWrapper(store, withDndContext),
      ...renderOptions,
    }),
  };
}
