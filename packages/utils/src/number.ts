export function isValidNumber(value: unknown): boolean {
  if (typeof value === "string") {
    const parsed = Number(value);
    return !isNaN(parsed) && isFinite(parsed) && value.trim() !== "";
  }

  if (typeof value === "number") {
    return !isNaN(value) && isFinite(value);
  }
  return false;
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
