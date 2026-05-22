export const TAG_TONE_VALUES = [
  "slate",
  "blue",
  "red",
  "amber",
  "green",
  "pink",
  "purple",
  "mint",
  "orange",
] as const;

export type TagTone = (typeof TAG_TONE_VALUES)[number];

export type TaskTagRecord = {
  label: string;
  tone: TagTone;
};
