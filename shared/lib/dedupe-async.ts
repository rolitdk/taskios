const inFlight = new Map<string, Promise<unknown>>();

/** Объединяет параллельные вызовы с одним ключом в один Promise (до завершения). */
export function dedupeAsync<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fn().finally(() => {
    inFlight.delete(key);
  });
  inFlight.set(key, promise);
  return promise;
}
