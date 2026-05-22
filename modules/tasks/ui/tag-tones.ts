import { TAG_TONE_VALUES, type TagTone } from "@/shared/model/task-tag";

export const TAG_TONES = TAG_TONE_VALUES;
export type { TagTone };

export const DEFAULT_TAG_TONE: TagTone = "purple";

export type TagToneStyle = {
  swatch: string;
  badge: string;
  ring: string;
};

export const TAG_TONE_STYLES: Record<TagTone, TagToneStyle> = {
  slate: {
    swatch: "bg-slate-500",
    badge: "bg-slate-100 text-slate-800 ring-1 ring-slate-200/60",
    ring: "ring-slate-500",
  },
  blue: {
    swatch: "bg-blue-500",
    badge: "bg-blue-100 text-blue-800 ring-1 ring-blue-200/60",
    ring: "ring-blue-500",
  },
  red: {
    swatch: "bg-red-500",
    badge: "bg-red-100 text-red-800 ring-1 ring-red-200/60",
    ring: "ring-red-500",
  },
  amber: {
    swatch: "bg-amber-400",
    badge: "bg-amber-100 text-amber-900 ring-1 ring-amber-200/60",
    ring: "ring-amber-400",
  },
  green: {
    swatch: "bg-green-500",
    badge: "bg-green-100 text-green-800 ring-1 ring-green-200/60",
    ring: "ring-green-500",
  },
  pink: {
    swatch: "bg-pink-500",
    badge: "bg-pink-100 text-pink-800 ring-1 ring-pink-200/60",
    ring: "ring-pink-500",
  },
  purple: {
    swatch: "bg-purple-500",
    badge: "bg-purple-100 text-purple-800 ring-1 ring-purple-200/60",
    ring: "ring-purple-500",
  },
  mint: {
    swatch: "bg-teal-500",
    badge: "bg-teal-100 text-teal-800 ring-1 ring-teal-200/60",
    ring: "ring-teal-500",
  },
  orange: {
    swatch: "bg-orange-500",
    badge: "bg-orange-100 text-orange-900 ring-1 ring-orange-200/60",
    ring: "ring-orange-500",
  },
};

export function getTagBadgeClass(tone: TagTone): string {
  return TAG_TONE_STYLES[tone].badge;
}
