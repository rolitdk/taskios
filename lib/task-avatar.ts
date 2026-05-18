import type { AvatarTone } from "@/lib/board-types";

export const AVATAR_TONE_CLASSES: Record<AvatarTone, string> = {
  soft: "bg-accent-soft text-accent-strong",
  muted: "bg-surface-muted text-accent-strong",
  shell: "bg-shell-bg text-foreground",
  accent: "bg-accent text-white",
  column: "bg-column-bg text-muted",
};

export const NEW_TASK_AVATAR_TONES: AvatarTone[] = [
  "soft",
  "muted",
  "shell",
  "accent",
];

export function pickAvatarTone(index: number): AvatarTone {
  return NEW_TASK_AVATAR_TONES[index % NEW_TASK_AVATAR_TONES.length] ?? "soft";
}

export function buildTaskInitials(title: string): string {
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "НЗ";
}
