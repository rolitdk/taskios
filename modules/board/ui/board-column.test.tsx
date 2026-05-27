import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BoardColumn as BoardColumnType } from "@/modules/board/model/board-types";
import { makeBoardTask } from "@/modules/tasks/lib/__fixtures__/board-tasks";
import { BoardColumn } from "@/modules/board/ui/board-column";

const clearColumnMocks = vi.hoisted(() => ({
  clearColumn: vi.fn(),
  isClearing: false,
  error: null as string | null,
  clearError: vi.fn(),
}));

vi.mock("@/modules/tasks/hooks/use-clear-column-tasks", () => ({
  useClearColumnTasks: () => ({
    clearColumn: clearColumnMocks.clearColumn,
    isClearing: clearColumnMocks.isClearing,
    error: clearColumnMocks.error,
    clearError: clearColumnMocks.clearError,
  }),
}));

vi.mock("@/modules/tasks/ui/sortable-task-card", () => ({
  SortableTaskCard: ({
    task,
    onEdit,
    highlighted,
  }: {
    task: { id: string; title: string };
    onEdit: (task: unknown) => void;
    highlighted?: boolean;
  }) => (
    <li>
      <span>{task.title}</span>
      {highlighted ? <span>highlighted</span> : null}
      <button type="button" onClick={() => onEdit(task)}>
        edit
      </button>
    </li>
  ),
}));

vi.mock("@dnd-kit/core", async () => {
  const actual =
    await vi.importActual<typeof import("@dnd-kit/core")>("@dnd-kit/core");

  return {
    ...actual,
    useDroppable: () => ({
      setNodeRef: () => undefined,
      isOver: false,
    }),
  };
});

function makeColumn(overrides: Partial<BoardColumnType> = {}): BoardColumnType {
  return {
    id: "todo",
    title: "К выполнению",
    tasks: [],
    ...overrides,
  };
}

describe("BoardColumn", () => {
  beforeEach(() => {
    clearColumnMocks.clearColumn.mockReset();
    clearColumnMocks.clearError.mockReset();
    clearColumnMocks.isClearing = false;
    clearColumnMocks.error = null;
  });

  it("renders empty state and disables clear action in menu", async () => {
    const user = userEvent.setup();

    render(
      <BoardColumn
        boardId="board-1"
        column={makeColumn({ tasks: [] })}
        onStartCreate={vi.fn()}
        onEditTask={vi.fn()}
      />,
    );

    expect(screen.getByText("Здесь пока нет задач")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Меню колонки" }));
    const clearItem = screen.getByRole("menuitem", {
      name: "Удалить все задачи",
    });
    expect(clearItem).toBeDisabled();
  });

  it("calls onStartCreate when add button is clicked", async () => {
    const user = userEvent.setup();
    const onStartCreate = vi.fn();

    render(
      <BoardColumn
        boardId="board-1"
        column={makeColumn({ id: "review", title: "На проверке" })}
        onStartCreate={onStartCreate}
        onEditTask={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Добавить задачу/i }));

    expect(onStartCreate).toHaveBeenCalledWith("review");
  });

  it("opens and closes column menu on outside pointerdown", async () => {
    const user = userEvent.setup();

    render(
      <BoardColumn
        boardId="board-1"
        column={makeColumn()}
        onStartCreate={vi.fn()}
        onEditTask={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Меню колонки" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens clear modal from menu and closes it on cancel", async () => {
    const user = userEvent.setup();

    render(
      <BoardColumn
        boardId="board-1"
        column={makeColumn({
          tasks: [makeBoardTask({ id: "task-1", status: "todo", order: 0 })],
        })}
        onStartCreate={vi.fn()}
        onEditTask={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Меню колонки" }));
    await user.click(
      screen.getByRole("menuitem", { name: "Удалить все задачи" }),
    );

    expect(clearColumnMocks.clearError).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("dialog", { name: "Очистка колонки" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Отмена" }));
    expect(clearColumnMocks.clearError).toHaveBeenCalledTimes(2);
    expect(
      screen.queryByRole("dialog", { name: "Очистка колонки" }),
    ).not.toBeInTheDocument();
  });

  it("confirms clear column and closes modal on success", async () => {
    const user = userEvent.setup();
    clearColumnMocks.clearColumn.mockResolvedValue(true);

    render(
      <BoardColumn
        boardId="board-1"
        column={makeColumn({
          id: "doing",
          title: "В работе",
          tasks: [
            makeBoardTask({ id: "task-1", status: "doing", order: 0 }),
            makeBoardTask({ id: "task-2", status: "doing", order: 1 }),
          ],
        })}
        onStartCreate={vi.fn()}
        onEditTask={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Меню колонки" }));
    await user.click(
      screen.getByRole("menuitem", { name: "Удалить все задачи" }),
    );

    await user.click(screen.getByRole("button", { name: "Удалить" }));

    await waitFor(() => {
      expect(clearColumnMocks.clearColumn).toHaveBeenCalledWith(
        "board-1",
        "doing",
      );
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Очистка колонки" }),
      ).not.toBeInTheDocument();
    });
  });

  it("shows clear error inside modal", async () => {
    const user = userEvent.setup();
    clearColumnMocks.error = "Не удалось очистить колонку";

    render(
      <BoardColumn
        boardId="board-1"
        column={makeColumn({
          tasks: [makeBoardTask({ id: "task-1", status: "todo", order: 0 })],
        })}
        onStartCreate={vi.fn()}
        onEditTask={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Меню колонки" }));
    await user.click(
      screen.getByRole("menuitem", { name: "Удалить все задачи" }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Не удалось очистить колонку",
    );
  });
});
