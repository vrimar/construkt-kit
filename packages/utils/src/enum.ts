export function isEnumKey<T extends object>(enumSrc: T, key: unknown): key is keyof T {
  return Number.isInteger(enumSrc[key as keyof T]);
}

export function enumToKeys<T extends object>(enumSrc: T): (keyof T)[] {
  return Object.keys(enumSrc).filter((key) => isNaN(Number(key))) as (keyof T)[];
}

export const mapEnumToFlags = <T extends number>(values: T[]) => {
  return values.reduce((flag, value) => {
    return flag | (value as number);
  }, 0);
};

export function enumToValues<T extends object>(enumSrc: T): T[keyof T][] {
  return enumToKeys(enumSrc).map((key: keyof T) => enumSrc[key]);
}

export function enumValueToKey<T extends object>(
  enumSrc: T,
  value: T[keyof T],
): keyof T | undefined {
  // For numeric enums, a reverse lookup works (enums have both directions)
  if (typeof value === "number" && (enumSrc as any)[value] !== undefined) {
    return (enumSrc as any)[value] as keyof T;
  }

  // For string enums (no reverse mapping), we search manually
  return Object.keys(enumSrc).find((key) => (enumSrc as any)[key] === value) as keyof T | undefined;
}

export function enumToEntries<T extends object>(enumSrc: T): [keyof T, T[keyof T]][] {
  return enumToValues(enumSrc).map((value: T[keyof T]) => [
    enumValueToKey(enumSrc, value) as keyof T,
    value,
  ]);
}

export function fromEnum<T extends object, C>(
  enumSrc: T,
  projection: (item: [keyof T, T[keyof T]], index: number, array: [keyof T, T[keyof T]][]) => C,
  skip?: (value: [keyof T, T[keyof T]], index: number, array: [keyof T, T[keyof T]][]) => boolean,
) {
  let entries = enumToEntries(enumSrc);

  if (skip) entries = entries.filter(skip);

  return entries.map(projection);
}

export function enumToOptions<T extends object>(enumSrc: T) {
  return fromEnum(enumSrc, ([label, value]) => ({
    label,
    value,
  }));
}

export function toListItems<T extends string | number>(
  record: Record<T, string>,
): { label: string; value: T }[] {
  return Object.entries(record).map(([key, label]) => ({
    label: label as string,
    value: key as T,
  }));
}

export function getEnumKeyByValue<T extends Record<string, string>>(
  enumObj: T,
  value: string,
): keyof T | undefined {
  return (Object.keys(enumObj) as Array<keyof T>).find((key) => enumObj[key] === value);
}
