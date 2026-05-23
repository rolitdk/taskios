import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildCreateTaskRequest,
  buildUpdateTaskRequest,
} from "@/modules/tasks/lib/create-task-payload";

const FROZEN_ISO = "2025-05-23T10:30:00.000Z";

describe("buildCreateTaskRequest", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(FROZEN_ISO));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds API payload with trimmed title and default description", () => {
    expect(
      buildCreateTaskRequest("board-1", {
        title: "  Новая задача  ",
        subtitle: "   ",
        status: "todo",
        tags: [{ label: "bug", tone: "red" }],
      }),
    ).toEqual({
      projectId: "board-1",
      title: "Новая задача",
      description: "Без описания",
      status: "todo",
      priority: "medium",
      dueDate: FROZEN_ISO,
      tags: [{ label: "bug", tone: "red" }],
    });
  });

  it("uses trimmed subtitle as description when provided", () => {
    expect(
      buildCreateTaskRequest("board-2", {
        title: "Task",
        subtitle: "  Детали  ",
        status: "doing",
        tags: [],
      }).description,
    ).toBe("Детали");
  });
});

describe("buildUpdateTaskRequest", () => {
  it("includes only defined fields with trimmed strings", () => {
    expect(
      buildUpdateTaskRequest({
        title: "  Updated  ",
        subtitle: "  Notes  ",
        status: "review",
        tags: [{ label: "qa", tone: "green" }],
      }),
    ).toEqual({
      title: "Updated",
      description: "Notes",
      status: "review",
      tags: [{ label: "qa", tone: "green" }],
    });
  });

  it("maps empty subtitle to «Без описания»", () => {
    expect(buildUpdateTaskRequest({ subtitle: "  " })).toEqual({
      description: "Без описания",
    });
  });

  it("returns empty object when no fields are provided", () => {
    expect(buildUpdateTaskRequest({})).toEqual({});
  });
});
