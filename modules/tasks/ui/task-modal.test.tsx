import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TaskModal } from "@/modules/tasks/ui/task-modal";

describe("TaskModal", () => {
  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("renders nothing when open is false", () => {
    render(
      <TaskModal open={false} onClose={vi.fn()} title="Новая задача">
        <p>Форма</p>
      </TaskModal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Форма")).not.toBeInTheDocument();
  });

  it("renders an accessible dialog when open", () => {
    render(
      <TaskModal open onClose={vi.fn()} title="Новая задача">
        <p>Форма</p>
      </TaskModal>,
    );

    const dialog = screen.getByRole("dialog", { name: "Новая задача" });

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(document.getElementById("task-modal-title")).toHaveTextContent(
      "Новая задача",
    );
    expect(screen.getByText("Форма")).toBeInTheDocument();
  });

  it("calls onClose when backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskModal open onClose={onClose} title="Новая задача">
        <p>Форма</p>
      </TaskModal>,
    );

    await user.click(screen.getByRole("button", { name: "Закрыть окно" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskModal open onClose={onClose} title="Новая задача">
        <p>Форма</p>
      </TaskModal>,
    );

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("locks body scroll while open and restores it on close", () => {
    document.body.style.overflow = "auto";

    const { rerender } = render(
      <TaskModal open onClose={vi.fn()} title="Новая задача">
        <p>Форма</p>
      </TaskModal>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <TaskModal open={false} onClose={vi.fn()} title="Новая задача">
        <p>Форма</p>
      </TaskModal>,
    );

    expect(document.body.style.overflow).toBe("auto");
  });

  it("restores body scroll on unmount", () => {
    document.body.style.overflow = "scroll";

    const { unmount } = render(
      <TaskModal open onClose={vi.fn()} title="Новая задача">
        <p>Форма</p>
      </TaskModal>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("scroll");
  });

  it("does not call onClose when dialog content is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskModal open onClose={onClose} title="Новая задача">
        <p>Форма</p>
      </TaskModal>,
    );

    await user.click(screen.getByText("Форма"));

    expect(onClose).not.toHaveBeenCalled();
  });
});
