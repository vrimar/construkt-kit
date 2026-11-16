import type { RangeStats } from "./types";

export class StatsAccumulator {
  private cellCount = 0;
  private count = 0;
  private numericCount = 0;
  private sum = 0;
  private min = Number.POSITIVE_INFINITY;
  private max = Number.NEGATIVE_INFINITY;

  add(value: unknown): void {
    this.cellCount++;
    if (value === null || value === undefined || value === "") return;
    this.count++;
    if (typeof value !== "number" || !Number.isFinite(value)) return;
    this.numericCount++;
    this.sum += value;
    if (value < this.min) this.min = value;
    if (value > this.max) this.max = value;
  }

  result(): RangeStats {
    const numeric = this.numericCount > 0;
    return {
      cellCount: this.cellCount,
      count: this.count,
      numericCount: this.numericCount,
      sum: this.sum,
      average: numeric ? this.sum / this.numericCount : null,
      min: numeric ? this.min : null,
      max: numeric ? this.max : null,
    };
  }
}
