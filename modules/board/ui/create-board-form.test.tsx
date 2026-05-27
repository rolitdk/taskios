import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CreateBoardForm } from "@/modules/board/ui/create-board-form";
import { renderWithProviders } from "@/test/render-with-providers";

type UseCreateBoardReturn = {
  createBoard: (title: string) => Promise<boolean>;
  isCreating: boolean;
  error: string | null;
  clearError: () => void;
};

let mockState: UseCreateBoardReturn;

vi.mock("@/modules/board/hooks/use-create-board", () => ({
  useCreateBoard: () => mockState,
}));

function setMockCreateBoardState(
  overrides: Partial<UseCreateBoardReturn> = {},
) {
  mockState = {
    createBoard: vi.fn(async () => true),
    isCreating: false,
    error: null,
    clearError: vi.fn(),
    ...overrides,
  };
}

describe("CreateBoardForm", () => {
  it("calls onCancel", async () => {
    setMockCreateBoardState();
    const onCancel = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<CreateBoardForm onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: "Отмена" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("validates required and does not call createBoard", async () => {
    const createBoard = vi.fn(async () => true);
    setMockCreateBoardState({ createBoard });
    const user = userEvent.setup();

    renderWithProviders(<CreateBoardForm onCancel={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Создать" }));

    expect(
      await screen.findByText("Введите название доски"),
    ).toBeInTheDocument();
    expect(createBoard).not.toHaveBeenCalled();
  });

  it("validates min length and does not call createBoard", async () => {
    const createBoard = vi.fn(async () => true);
    setMockCreateBoardState({ createBoard });
    const user = userEvent.setup();

    renderWithProviders(<CreateBoardForm onCancel={vi.fn()} />);

    await user.type(
      screen.getByPlaceholderText("Например, рабочие задачи"),
      "A",
    );
    await user.click(screen.getByRole("button", { name: "Создать" }));

    expect(await screen.findByText("Минимум 2 символа")).toBeInTheDocument();
    expect(createBoard).not.toHaveBeenCalled();
  });

  it("disables submit while creating", () => {
    setMockCreateBoardState({ isCreating: true });

    renderWithProviders(<CreateBoardForm onCancel={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Создать" })).toBeDisabled();
  });

  it("renders server error", () => {
    setMockCreateBoardState({ error: "Ошибка сервера" });

    renderWithProviders(<CreateBoardForm onCancel={vi.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Ошибка сервера");
  });

  it("submits title and calls onCreated on success", async () => {
    const createBoard = vi.fn(async () => true);
    setMockCreateBoardState({ createBoard });

    const onCreated = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <CreateBoardForm onCancel={vi.fn()} onCreated={onCreated} />,
    );

    await user.type(
      screen.getByPlaceholderText("Например, рабочие задачи"),
      "Моя доска",
    );
    await user.click(screen.getByRole("button", { name: "Создать" }));

    expect(createBoard).toHaveBeenCalledWith("Моя доска");
    expect(onCreated).toHaveBeenCalledTimes(1);
  });

  it("does not call onCreated when createBoard returns false", async () => {
    const createBoard = vi.fn(async () => false);
    setMockCreateBoardState({ createBoard });

    const onCreated = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <CreateBoardForm onCancel={vi.fn()} onCreated={onCreated} />,
    );

    await user.type(
      screen.getByPlaceholderText("Например, рабочие задачи"),
      "Моя доска",
    );
    await user.click(screen.getByRole("button", { name: "Создать" }));

    expect(createBoard).toHaveBeenCalledWith("Моя доска");
    expect(onCreated).not.toHaveBeenCalled();
  });
});
