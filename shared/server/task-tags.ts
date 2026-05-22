import type { Prisma } from "@prisma/client";

import {
  TAG_TONE_VALUES,
  type TagTone,
  type TaskTagRecord,
} from "@/shared/model/task-tag";

const tagToneSet = new Set<string>(TAG_TONE_VALUES);

export function normalizeTaskTags(
  tags: { label: string; tone: TagTone }[],
): TaskTagRecord[] {
  return tags
    .map((tag) => ({
      label: tag.label.trim(),
      tone: tag.tone,
    }))
    .filter((tag) => tag.label.length > 0);
}

export function parseTaskTagsFromJson(value: Prisma.JsonValue): TaskTagRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const result: TaskTagRecord[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      continue;
    }

    const record = item as Record<string, unknown>;
    const label = typeof record.label === "string" ? record.label.trim() : "";
    const tone = typeof record.tone === "string" ? record.tone : "";

    if (!label || !tagToneSet.has(tone)) {
      continue;
    }

    result.push({
      label,
      tone: tone as TagTone,
    });
  }

  return result;
}

export function taskTagsToJson(tags: TaskTagRecord[]): Prisma.InputJsonValue {
  return tags;
}
