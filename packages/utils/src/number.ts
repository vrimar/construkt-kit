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
