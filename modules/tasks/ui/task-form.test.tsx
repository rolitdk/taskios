import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeBoardTask } from "@/modules/tasks/lib/__fixtures__/board-tasks";
import { TaskForm } from "@/modules/tasks/ui/task-form";

const createTaskMocks = vi.hoisted(() => ({
  createTask: vi.fn(),
  isCreating: false,
  error: null as string | null,
  clearError: vi.fn(),
}));

const editTaskMocks = vi.hoisted(() => ({
  editTask: vi.fn(),
  isSaving: false,
  error: null as string | null,
  clearError: vi.fn(),
}));

vi.mock("@/modules/tasks/hooks/use-create-task", () => ({
  useCreateTask: () => ({
    createTask: createTaskMocks.createTask,
    isCreating: createTaskMocks.isCreating,
    error: createTaskMocks.error,
    clearError: createTaskMocks.clearError,
  }),
}));

vi.mock("@/modules/tasks/hooks/use-edit-task", () => ({
  useEditTask: () => ({
    editTask: editTaskMocks.editTask,
    isSaving: editTaskMocks.isSaving,
    error: editTaskMocks.error,
    clearError: editTaskMocks.clearError,
  }),
}));

function renderCreateForm(
  overrides: Partial<{
    onCancel: () => void;
    onCreated: () => void;
    defaultStatus: "todo" | "doing" | "review" | "done";
  }> = {},
) {
  const onCancel = overrides.onCancel ?? vi.fn();
  const onCreated = overrides.onCreated ?? vi.fn();

  render(
    <TaskForm
      mode="create"
      boardId="board-1"
      defaultStatus={overrides.defaultStatus ?? "todo"}
      onCancel={onCancel}
      onCreated={onCreated}
    />,
  );

  return { onCancel, onCreated };
}

function renderEditForm(
  task = makeBoardTask({
    id: "task-1",
    status: "todo",
    order: 0,
    title: "Сверстать карточку",
    subtitle: "Без описания",
    tags: [{ label: "UI", tone: "blue" }],
  }),
  overrides: Partial<{
    onCancel: () => void;
    onSaved: () => void;
  }> = {},
) {
  const onCancel = overrides.onCancel ?? vi.fn();
  const onSaved = overrides.onSaved ?? vi.fn();

  render(
    <TaskForm
      mode="edit"
      boardId="board-1"
      task={task}
      onCancel={onCancel}
      onSaved={onSaved}
    />,
  );

  return { onCancel, onSaved, task };
}

describe("TaskForm", () => {
  beforeEach(() => {
    createTaskMocks.createTask.mockReset();
    createTaskMocks.clearError.mockReset();
    createTaskMocks.isCreating = false;
    createTaskMocks.error = null;

    editTaskMocks.editTask.mockReset();
    editTaskMocks.clearError.mockReset();
    editTaskMocks.isSaving = false;
    editTaskMocks.error = null;
  });

  afterEach(() => {
    createTaskMocks.isCreating = false;
    createTaskMocks.error = null;
    editTaskMocks.isSaving = false;
    editTaskMocks.error = null;
  });

  describe("create mode", () => {
    it("shows validation error when title is empty", async () => {
      const user = userEvent.setup();
      renderCreateForm();

      await user.click(screen.getByRole("button", { name: "Создать" }));

      expect(screen.getByText("Введите название задачи")).toBeInTheDocument();
      expect(createTaskMocks.createTask).not.toHaveBeenCalled();
    });

    it("shows validation error when title is too short", async () => {
      const user = userEvent.setup();
      renderCreateForm();

      await user.type(
        screen.getByPlaceholderText("Например, сверстать карточку"),
        "A",
      );
      await user.click(screen.getByRole("button", { name: "Создать" }));

      expect(screen.getByText("Минимум 2 символа")).toBeInTheDocument();
      expect(createTaskMocks.createTask).not.toHaveBeenCalled();
    });

    it("submits filtered tags and calls onCreated on success", async () => {
      const user = userEvent.setup();
      createTaskMocks.createTask.mockResolvedValue(true);
      const { onCreated } = renderCreateForm();

      await user.type(
        screen.getByPlaceholderText("Например, сверстать карточку"),
        "Новая задача",
      );

      await user.click(screen.getByRole("button", { name: "Добавить тег" }));
      const tagInputs = screen.getAllByPlaceholderText("Название тега");
      await user.type(tagInputs[0]!, "  design  ");

      await user.click(screen.getByRole("button", { name: "Добавить тег" }));
      await user.type(
        screen.getAllByPlaceholderText("Название тега")[1]!,
        "   ",
      );

      await user.click(screen.getByRole("button", { name: "Добавить тег" }));
      await user.type(
        screen.getAllByPlaceholderText("Название тега")[2]!,
        "urgent",
      );

      await user.click(screen.getByRole("button", { name: "Создать" }));

      await waitFor(() => {
        expect(createTaskMocks.createTask).toHaveBeenCalledWith({
          boardId: "board-1",
          title: "Новая задача",
          subtitle: "",
          status: "todo",
          tags: [
            { label: "design", tone: "purple" },
            { label: "urgent", tone: "purple" },
          ],
        });
      });
      expect(onCreated).toHaveBeenCalledTimes(1);
    });

    it("shows API error from create hook", () => {
      createTaskMocks.error = "Не удалось создать задачу";
      renderCreateForm();

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Не удалось создать задачу",
      );
    });

    it("disables submit while task is being created", () => {
      createTaskMocks.isCreating = true;
      renderCreateForm();

      expect(screen.getByRole("button", { name: "Создать" })).toBeDisabled();
    });
  });

  describe("edit mode", () => {
    it("prefills fields from task and clears placeholder subtitle", () => {
      renderEditForm();

      expect(
        screen.getByPlaceholderText("Например, сверстать карточку"),
      ).toHaveValue("Сверстать карточку");
      expect(screen.getByPlaceholderText("Срок или заметка")).toHaveValue("");
      expect(screen.getByRole("combobox")).toHaveValue("todo");
      expect(screen.getByPlaceholderText("Название тега")).toHaveValue("UI");
    });

    it("submits with updated column status", async () => {
      const user = userEvent.setup();
      editTaskMocks.editTask.mockResolvedValue(true);
      const { onSaved, task } = renderEditForm();

      await user.selectOptions(screen.getByRole("combobox"), "review");
      await user.click(screen.getByRole("button", { name: "Сохранить" }));

      await waitFor(() => {
        expect(editTaskMocks.editTask).toHaveBeenCalledWith({
          boardId: "board-1",
          taskId: task.id,
          title: "Сверстать карточку",
          subtitle: "",
          status: "review",
          tags: [{ label: "UI", tone: "blue" }],
        });
      });
      expect(onSaved).toHaveBeenCalledTimes(1);
    });

    it("shows API error from edit hook", () => {
      editTaskMocks.error = "Не удалось сохранить задачу";
      renderEditForm();

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Не удалось сохранить задачу",
      );
    });

    it("disables submit while task is being saved", () => {
      editTaskMocks.isSaving = true;
      renderEditForm();

      expect(screen.getByRole("button", { name: "Сохранить" })).toBeDisabled();
    });
  });

  describe("both modes", () => {
    it("calls onCancel without submitting in create mode", async () => {
      const user = userEvent.setup();
      const { onCancel } = renderCreateForm();

      await user.type(
        screen.getByPlaceholderText("Например, сверстать карточку"),
        "Черновик",
      );
      await user.click(screen.getByRole("button", { name: "Отмена" }));

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(createTaskMocks.createTask).not.toHaveBeenCalled();
    });

    it("calls onCancel without submitting in edit mode", async () => {
      const user = userEvent.setup();
      const { onCancel } = renderEditForm();

      await user.click(screen.getByRole("button", { name: "Отмена" }));

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(editTaskMocks.editTask).not.toHaveBeenCalled();
    });
  });
});
