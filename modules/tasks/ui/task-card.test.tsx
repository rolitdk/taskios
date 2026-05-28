import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeBoardTask } from "@/modules/tasks/lib/__fixtures__/board-tasks";
import { TaskCard } from "@/modules/tasks/ui/task-card";

const deleteTaskMocks = vi.hoisted(() => ({
  deleteTask: vi.fn(),
}));

vi.mock("@/modules/tasks/hooks/use-delete-task", () => ({
  useDeleteTask: () => ({
    deleteTask: deleteTaskMocks.deleteTask,
    isDeleting: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

const baseTask = makeBoardTask({
  id: "task-1",
  status: "todo",
  order: 0,
  title: "Сверстать карточку",
  subtitle: "До пятницы",
  initials: "СК",
  avatarTone: "accent",
  tags: [
    { label: "UI", tone: "blue" },
    { label: "Срочно", tone: "red" },
  ],
});

describe("TaskCard", () => {
  beforeEach(() => {
    deleteTaskMocks.deleteTask.mockReset();
  });

  it("renders title, subtitle, initials, and tags", () => {
    render(<TaskCard boardId="board-1" task={baseTask} />);

    expect(
      screen.getByRole("heading", { name: "Сверстать карточку" }),
    ).toBeInTheDocument();
    expect(screen.getByText("До пятницы")).toBeInTheDocument();
    expect(screen.getByText("СК")).toBeInTheDocument();
    expect(screen.getByText("UI")).toBeInTheDocument();
    expect(screen.getByText("Срочно")).toBeInTheDocument();
  });

  it("does not render tag list when task has no tags", () => {
    const task = makeBoardTask({
      id: "task-2",
      status: "todo",
      order: 1,
      title: "Без тегов",
      tags: [],
    });

    render(<TaskCard boardId="board-1" task={task} />);

    expect(screen.getByText("Без тегов")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <TaskCard
        boardId="board-1"
        task={baseTask}
        onEdit={onEdit}
        showDelete={false}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Редактировать задачу «Сверстать карточку»",
      }),
    );

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("calls deleteTask when delete button is clicked", async () => {
    const user = userEvent.setup();

    render(<TaskCard boardId="board-1" task={baseTask} />);

    await user.click(
      screen.getByRole("button", {
        name: "Удалить задачу «Сверстать карточку»",
      }),
    );

    expect(deleteTaskMocks.deleteTask).toHaveBeenCalledWith({
      boardId: "board-1",
      task: baseTask,
    });
  });

  it("hides delete button when showDelete is false", () => {
    render(<TaskCard boardId="board-1" task={baseTask} showDelete={false} />);

    expect(
      screen.queryByRole("button", {
        name: "Удалить задачу «Сверстать карточку»",
      }),
    ).not.toBeInTheDocument();
  });

  it("applies highlight classes when highlighted is true", () => {
    const { container } = render(
      <TaskCard boardId="board-1" task={baseTask} highlighted />,
    );

    const article = container.querySelector("article");

    expect(article?.className).toContain("ring-accent-strong");
    expect(article?.className).toContain("animate-task-highlight");
  });
});
