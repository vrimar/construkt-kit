import type { ColumnModel, Leaf, Region } from "../columns/columnModel";
import type { CellContext } from "../columns/types";
import type { RowModel } from "../rows/rowModel";

export interface CellSpan {
  row: number;
  column: number;
  rows: number;
  columns: number;
}

interface Runs {
  anchors: Int32Array;
  lengths: Int32Array;
  end: number;
}

export class SpanIndex<TRow, TNode> {
  readonly active: boolean;
  private readonly runs = new Map<number, Runs>();
  private readonly widths = new Map<number, Int32Array>();
  private readonly regionEnds: Int32Array;
  private readonly sweepLeaves: readonly Leaf<TRow, TNode>[];
  private swept = 0;

  constructor(
    private readonly rows: RowModel<TRow>,
    private readonly columns: ColumnModel<TRow, TNode>,
    private readonly contextOf: (row: number, column: number) => CellContext<TRow>,
  ) {
    const { leaves } = columns;
    const count = rows.rowCount;
    this.regionEnds = new Int32Array(leaves.length);
    const lastRowSpan = new Map<Region, number>();
    for (let index = leaves.length - 1; index >= 0; index--) {
      const leaf = leaves[index];
      const next = leaves[index + 1];
      this.regionEnds[index] = next?.region === leaf.region ? this.regionEnds[index + 1] : index;
      if (leaf.def.rowSpan) {
        this.runs.set(index, {
          anchors: new Int32Array(count),
          lengths: new Int32Array(count),
          end: 0,
        });
        if (!lastRowSpan.has(leaf.region)) lastRowSpan.set(leaf.region, index);
      }
      if (leaf.def.colSpan) this.widths.set(index, new Int32Array(count));
    }
    this.sweepLeaves = leaves.filter(
      (leaf) =>
        leaf.def.rowSpan || (leaf.def.colSpan && leaf.index < (lastRowSpan.get(leaf.region) ?? -1)),
    );
    this.active = this.runs.size > 0 || this.widths.size > 0;
  }

  anchorsAbove(row: number): number[] {
    if (row <= 0 || row >= this.rows.rowCount) return [];
    this.sweep(row);
    const anchors = new Set<number>();
    for (const runs of this.runs.values()) {
      const anchor = runs.anchors[row];
      if (anchor < row) anchors.add(anchor);
    }
    return [...anchors].sort((a, b) => a - b);
  }

  rowSpans(row: number, columns: readonly number[]): Map<number, CellSpan> {
    const spans = new Map<number, CellSpan>();
    if (!this.active || this.rows.kindOf(row) === "fullWidth") return spans;
    this.sweep(row);
    const { leaves } = this.columns;
    const regions = new Set(columns.map((column) => leaves[column]?.region));
    let covering: CellSpan | undefined;
    for (const leaf of leaves) {
      if (!regions.has(leaf.region)) continue;
      if (!covering || leaf.index >= covering.column + covering.columns) {
        const runs = this.runs.get(leaf.index);
        const anchor = runs ? runs.anchors[row] : row;
        covering = {
          row: anchor,
          column: leaf.index,
          rows: runs ? runs.lengths[anchor] : 1,
          columns: this.widthAt(anchor, leaf),
        };
      }
      spans.set(leaf.index, covering);
    }
    return spans;
  }

  spanAt(row: number, column: number): CellSpan {
    return this.rowSpans(row, [column]).get(column) ?? { row, column, rows: 1, columns: 1 };
  }

  private sweep(upTo: number): void {
    const count = this.rows.rowCount;
    while (this.swept <= upTo && this.swept < count) {
      const row = this.swept;
      let coveredTo = -1;
      for (const leaf of this.sweepLeaves) {
        const runs = this.runs.get(leaf.index);
        const covered = leaf.index <= coveredTo;
        if (runs && row >= runs.end) this.startRun(row, leaf, runs, covered);
        if (covered) continue;
        const anchor = runs ? runs.anchors[row] : row;
        coveredTo = leaf.index + this.widthAt(anchor, leaf) - 1;
      }
      this.swept++;
    }
  }

  private startRun(row: number, leaf: Leaf<TRow, TNode>, runs: Runs, covered: boolean): void {
    const count = this.rows.rowCount;
    const open = (next: number) => next < count && !this.isBoundary(next);
    const { rowSpan } = leaf.def;
    let length = 1;
    if (!covered && rowSpan && !this.isBoundary(row)) {
      if (rowSpan === "sameValue") {
        const value = leaf.getValue(this.rows.nodeAt(row).data);
        while (
          open(row + length) &&
          Object.is(leaf.getValue(this.rows.nodeAt(row + length).data), value)
        ) {
          length++;
        }
      } else {
        const requested = Math.floor(
          rowSpan(this.rows.nodeAt(row).data, this.contextOf(row, leaf.index)),
        );
        while (length < requested && open(row + length)) length++;
      }
    }
    runs.anchors.fill(row, row, row + length);
    runs.lengths[row] = length;
    runs.end = row + length;
  }

  private widthAt(row: number, leaf: Leaf<TRow, TNode>): number {
    const widths = this.widths.get(leaf.index);
    const { colSpan } = leaf.def;
    if (!widths || !colSpan) return 1;
    if (widths[row] === 0) {
      const requested = this.isBoundary(row)
        ? 1
        : Math.floor(colSpan(this.rows.nodeAt(row).data, this.contextOf(row, leaf.index)));
      const last = Math.min(this.regionEnds[leaf.index], leaf.index + requested - 1);
      let column = leaf.index;
      while (column < last && !this.claimedFromAbove(row, column + 1)) column++;
      widths[row] = column - leaf.index + 1;
    }
    return widths[row];
  }

  private claimedFromAbove(row: number, column: number): boolean {
    const runs = this.runs.get(column);
    if (!runs || row === 0) return false;
    const anchor = runs.anchors[row - 1];
    return anchor + runs.lengths[anchor] > row;
  }

  private isBoundary(row: number): boolean {
    return this.rows.kindOf(row) !== "leaf";
  }
}
