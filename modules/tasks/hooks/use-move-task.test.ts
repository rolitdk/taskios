import { describe, expect, it, vi } from "vitest";

import {
  runOptimisticTaskMove,
  type MoveTaskInput,
} from "@/modules/tasks/hooks/use-move-task";
import { moveTask } from "@/modules/tasks/model/tasks-slice";
import type { AppDispatch } from "@/store/store";

const BOARD_ID = "board-1";
const TASK_ID = "task-1";

const baseInput: MoveTaskInput = {
  boardId: BOARD_ID,
  taskId: TASK_ID,
  status: "doing",
  order: 1,
  previousStatus: "todo",
  previousOrder: 0,
};

function createDispatchMock() {
  return vi.fn() as AppDispatch;
}

describe("runOptimisticTaskMove", () => {
  it("applies optimistic move and returns true when API succeeds", async () => {
    const dispatch = createDispatchMock();
    const updateTaskApi = vi.fn().mockResolvedValue({});

    const ok = await runOptimisticTaskMove(dispatch, baseInput, updateTaskApi);

    expect(ok).toBe(true);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      moveTask({
        boardId: BOARD_ID,
        taskId: TASK_ID,
        status: "doing",
        order: 1,
      }),
    );
    expect(updateTaskApi).toHaveBeenCalledWith(TASK_ID, {
      status: "doing",
      sortOrder: 1,
    });
  });

  it("rolls back to previous position when API fails", async () => {
    const dispatch = createDispatchMock();
    const updateTaskApi = vi.fn().mockRejectedValue(new Error("network"));

    const ok = await runOptimisticTaskMove(dispatch, baseInput, updateTaskApi);

    expect(ok).toBe(false);
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      moveTask({
        boardId: BOARD_ID,
        taskId: TASK_ID,
        status: "doing",
        order: 1,
      }),
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      moveTask({
        boardId: BOARD_ID,
        taskId: TASK_ID,
        status: "todo",
        order: 0,
      }),
    );
  });
});
