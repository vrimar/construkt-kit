export function isValidNumber(value: unknown): boolean {
  if (typeof value === "string") {
    const parsed = Number(value);
    return !isNaN(parsed) && isFinite(parsed) && value.trim() !== "";
  }

  return isStrictlyNumeric(value) && isFinite(value);
}

export function toInt(input: number | string | null | undefined): number {
  if (isStrictlyNumeric(input)) return Math.trunc(input);
  if (input == null) return 0;
  const parsed = Number(input);
  return isNaN(parsed) ? 0 : Math.trunc(parsed);
}

export function isStrictlyNumeric(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}
