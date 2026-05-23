import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  createTaskSchema,
  formatZodErrorMessage,
  loginSchema,
  updateTaskSchema,
} from "@/shared/server/validation";

const VALID_DUE_DATE = "2025-05-23T10:30:00.000Z";

describe("formatZodErrorMessage", () => {
  it("returns default message when there are no issues", () => {
    expect(formatZodErrorMessage(new z.ZodError([]))).toBe(
      "Неверные входные данные",
    );
  });

  it("prefixes field path for nested issues", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const message = formatZodErrorMessage(result.error);
      expect(message).toMatch(/^email: /);
    }
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(
      loginSchema.safeParse({
        email: "user@example.com",
        password: "secret",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "bad",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("createTaskSchema", () => {
  const validPayload = {
    projectId: "board-1",
    title: "Задача",
    description: "Описание",
    status: "todo" as const,
    priority: "medium" as const,
    dueDate: VALID_DUE_DATE,
    tags: [{ label: "bug", tone: "red" as const }],
  };

  it("parses valid payload and transforms dueDate to Date", () => {
    const result = createTaskSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dueDate).toBeInstanceOf(Date);
      expect(result.data.tags).toEqual([{ label: "bug", tone: "red" }]);
    }
  });

  it("defaults tags to empty array when omitted", () => {
    const { tags: _tags, ...withoutTags } = validPayload;
    const result = createTaskSchema.safeParse(withoutTags);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it("rejects unknown status", () => {
    const result = createTaskSchema.safeParse({
      ...validPayload,
      status: "blocked",
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 32 tags", () => {
    const tags = Array.from({ length: 33 }, (_, index) => ({
      label: `tag-${index}`,
      tone: "slate" as const,
    }));
    const result = createTaskSchema.safeParse({ ...validPayload, tags });
    expect(result.success).toBe(false);
  });

  it("rejects tag with invalid tone", () => {
    const result = createTaskSchema.safeParse({
      ...validPayload,
      tags: [{ label: "x", tone: "neon" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("updateTaskSchema", () => {
  it("accepts partial updates", () => {
    const result = updateTaskSchema.safeParse({
      title: "  Updated  ",
      status: "done",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Updated");
    }
  });

  it("accepts sortOrder when non-negative integer", () => {
    const result = updateTaskSchema.safeParse({ sortOrder: 2 });
    expect(result.success).toBe(true);
  });

  it("rejects negative sortOrder", () => {
    const result = updateTaskSchema.safeParse({ sortOrder: -1 });
    expect(result.success).toBe(false);
  });

  it("allows optional tags without projectId", () => {
    const result = updateTaskSchema.safeParse({
      tags: [{ label: "qa", tone: "green" }],
    });
    expect(result.success).toBe(true);
  });
});
