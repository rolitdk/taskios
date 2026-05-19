/** Публичные поля пользователя (без хешей). */
export type PublicUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export function getUserInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : "?";
}
