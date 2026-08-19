const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Recursive merge where arrays and primitives from `overrides` replace the base value. */
export function deepMerge<T>(base: T, overrides: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(overrides)) {
    return overrides === undefined ? base : (overrides as T);
  }

  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    merged[key] = key in base ? deepMerge(base[key], value) : value;
  }

  return merged as T;
}
