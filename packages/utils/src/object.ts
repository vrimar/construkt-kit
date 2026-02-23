export type ObjectKeys<T extends object> = `${Exclude<keyof T, symbol>}`;

export const objectKeys = Object.keys as <Type extends object>(
  value: Type,
) => Array<ObjectKeys<Type>>;

export function toKeyValue<T extends Record<string, any>, K extends keyof T>(
  array: T[],
  key: K,
): Record<T[K], T> {
  return array.reduce(
    (acc, item) => {
      acc[item[key]] = item;
      return acc;
    },
    {} as Record<T[K], T>,
  );
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}
