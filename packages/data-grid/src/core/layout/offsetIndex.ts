import type { AxisMetrics } from "./axisWindow";

export class OffsetIndex implements AxisMetrics {
  private heights = new Float64Array(0);
  private prefix = new Float64Array(1);
  private valid = 0;
  private size = 0;

  get count(): number {
    return this.size;
  }

  get total(): number {
    return this.offsetOf(this.size);
  }

  reset(count: number, heightAt: (index: number) => number, from = 0): void {
    if (count !== this.size) {
      const heights = new Float64Array(count);
      heights.set(this.heights.subarray(0, Math.min(from, count, this.size)));
      const prefix = new Float64Array(count + 1);
      prefix.set(this.prefix.subarray(0, Math.min(from, this.valid) + 1));
      this.heights = heights;
      this.prefix = prefix;
      this.size = count;
    }
    for (let index = from; index < count; index++) this.heights[index] = heightAt(index);
    this.valid = Math.min(this.valid, from, count);
  }

  heightOf(index: number): number {
    return this.heights[index] ?? 0;
  }

  offsetOf(index: number): number {
    const target = Math.max(0, Math.min(index, this.size));
    this.extendTo(target);
    return this.prefix[target];
  }

  indexAt(offset: number): number {
    if (this.size === 0) return -1;
    while (this.valid < this.size && this.prefix[this.valid] <= offset) {
      this.extendTo(this.valid + 1);
    }
    let low = 0;
    let high = Math.min(this.valid, this.size - 1);
    while (low < high) {
      const mid = (low + high + 1) >> 1;
      if (this.prefix[mid] <= offset) low = mid;
      else high = mid - 1;
    }
    return low;
  }

  private extendTo(index: number) {
    for (let k = this.valid; k < index; k++) {
      this.prefix[k + 1] = this.prefix[k] + this.heights[k];
    }
    if (index > this.valid) this.valid = index;
  }
}
