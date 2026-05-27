import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeBoardTask } from "@/modules/tasks/lib/__fixtures__/board-tasks";
import { GlobalSearch } from "@/modules/tasks/ui/global-search";
import { mockRouter } from "@/test/mocks/next-navigation";
import { renderWithProviders } from "@/test/render-with-providers";

const SEARCH_DEBOUNCE_MS = 300;

function renderSearch() {
  return renderWithProviders(<GlobalSearch />, {
    preloadedState: {
      tasks: {
        activeBoardId: "board-1",
        boardCatalog: [
          { id: "board-1", title: "Личный" },
          { id: "board-2", title: "Работа" },
        ],
        boards: {
          "board-1": [
            makeBoardTask({
              id: "task-11",
              status: "todo",
              order: 0,
              title: "Купить молоко",
              subtitle: "Вечером",
              tags: [{ label: "дом", tone: "blue" }],
            }),
          ],
          "board-2": [
            makeBoardTask({
              id: "task-22",
              status: "doing",
              order: 0,
              title: "Пофиксить поиск",
              subtitle: "debounce",
              tags: [{ label: "ui", tone: "purple" }],
            }),
          ],
        },
        boardCatalogIdsKey: null,
        loadedBoardIdsKey: null,
      },
    },
  });
}

function getSearchInput() {
  return screen.getByRole("combobox", { name: "Поиск задач по всем доскам" });
}

describe("GlobalSearch", () => {
  beforeEach(() => {
    mockRouter.push.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not show dropdown for whitespace-only query", async () => {
    vi.useFakeTimers();
    renderSearch();

    const input = getSearchInput();
    fireEvent.change(input, { target: { value: "   " } });

    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("shows results after debounce and navigates on selection", async () => {
    vi.useFakeTimers();
    renderSearch();

    const input = getSearchInput();
    fireEvent.change(input, { target: { value: "поиск" } });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    const listbox = screen.getByRole("listbox");
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(listbox).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Пофиксить поиск/i }));

    expect(mockRouter.push).toHaveBeenCalledWith(
      "/boards/board-2?task=task-22",
    );
    expect(input).toHaveValue("");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("shows 'Ничего не найдено' for non-matching query", async () => {
    vi.useFakeTimers();
    renderSearch();

    const input = getSearchInput();
    fireEvent.change(input, { target: { value: "не существует" } });
    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Ничего не найдено")).toBeInTheDocument();
  });

  it("clears search on Escape and closes dropdown", async () => {
    vi.useFakeTimers();
    renderSearch();

    const input = getSearchInput();
    fireEvent.change(input, { target: { value: "молоко" } });
    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Escape" });

    expect(input).toHaveValue("");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("closes dropdown on outside pointerdown without clearing input", async () => {
    vi.useFakeTimers();
    renderSearch();

    const input = getSearchInput();
    fireEvent.change(input, { target: { value: "молоко" } });
    act(() => {
      vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    expect(input).toHaveValue("молоко");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});
