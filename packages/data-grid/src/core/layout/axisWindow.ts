export interface AxisMetrics {
  readonly count: number;
  readonly total: number;
  offsetOf(index: number): number;
  indexAt(offset: number): number;
}

export class AxisWindow {
  start = 0;
  end = 0;

  update(viewStart: number, viewEnd: number, overscan: number, metrics: AxisMetrics): boolean {
    const { count, total } = metrics;
    if (count === 0) return this.set(0, 0);
    const margin = overscan / 4;
    const needStart = Math.max(0, viewStart - margin);
    const needEnd = Math.min(total, viewEnd + margin);
    if (
      this.end > this.start &&
      this.end <= count &&
      metrics.offsetOf(this.start) <= needStart &&
      metrics.offsetOf(this.end) >= needEnd
    ) {
      return false;
    }
    const start = metrics.indexAt(Math.max(0, viewStart - overscan));
    const end = metrics.indexAt(Math.min(total - 1, viewEnd + overscan)) + 1;
    return this.set(Math.max(0, start), Math.min(count, Math.max(end, start + 1)));
  }

  invalidate(): void {
    this.start = 0;
    this.end = 0;
  }

  private set(start: number, end: number) {
    if (start === this.start && end === this.end) return false;
    this.start = start;
    this.end = end;
    return true;
  }
}
