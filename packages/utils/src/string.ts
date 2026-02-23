export function toCamelCase(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

export function toInt(input: number | string | null | undefined): number {
  if (isStrictlyNumeric(input)) return input as number;
  if (input == null) return 0;
  const parsed = Number(input);
  return isNaN(parsed) ? 0 : Math.trunc(parsed);
}

export function isStrictlyNumeric(value: unknown) {
  return typeof value === "number" && !isNaN(value);
}
