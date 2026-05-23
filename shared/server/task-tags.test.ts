import { describe, expect, it } from "vitest";

import {
  normalizeTaskTags,
  parseTaskTagsFromJson,
  taskTagsToJson,
} from "@/shared/server/task-tags";

describe("normalizeTaskTags", () => {
  it("trims labels and keeps valid tones", () => {
    expect(
      normalizeTaskTags([
        { label: "  bug  ", tone: "red" },
        { label: "feature", tone: "green" },
      ]),
    ).toEqual([
      { label: "bug", tone: "red" },
      { label: "feature", tone: "green" },
    ]);
  });

  it("drops tags with empty label after trim", () => {
    expect(
      normalizeTaskTags([
        { label: "   ", tone: "blue" },
        { label: "ok", tone: "slate" },
      ]),
    ).toEqual([{ label: "ok", tone: "slate" }]);
  });
});

describe("parseTaskTagsFromJson", () => {
  it("returns empty array for non-array JSON", () => {
    expect(parseTaskTagsFromJson(null)).toEqual([]);
    expect(parseTaskTagsFromJson({ label: "x", tone: "red" })).toEqual([]);
    expect(parseTaskTagsFromJson("tags")).toEqual([]);
  });

  it("parses valid tag objects", () => {
    expect(
      parseTaskTagsFromJson([
        { label: "  bug  ", tone: "red" },
        { label: "docs", tone: "blue" },
      ]),
    ).toEqual([
      { label: "bug", tone: "red" },
      { label: "docs", tone: "blue" },
    ]);
  });

  it("skips invalid entries: wrong shape, empty label, unknown tone", () => {
    expect(
      parseTaskTagsFromJson([
        null,
        "string",
        [],
        { label: "", tone: "red" },
        { label: "no-tone", tone: 1 },
        { label: "bad-tone", tone: "neon" },
        { label: "valid", tone: "amber" },
      ]),
    ).toEqual([{ label: "valid", tone: "amber" }]);
  });
});

describe("taskTagsToJson", () => {
  it("returns tags as Prisma JSON input", () => {
    const tags = [{ label: "bug", tone: "red" as const }];
    expect(taskTagsToJson(tags)).toBe(tags);
  });
});
