import type { AxisMetrics } from "../layout/axisWindow";
import { columnLetter } from "./letters";
import { distribute } from "./sizing";
import type { ColumnDef, ColumnPinning, ColumnSizing, ColumnVisibility, PinnedSide } from "./types";

const DEFAULT_COLUMN_WIDTH = 150;
const MIN_COLUMN_WIDTH = 40;

export type Region = "left" | "center" | "right";

export interface ColumnState {
  columnSizing: ColumnSizing;
  columnPinning: ColumnPinning;
  columnVisibility: ColumnVisibility;
}

export interface Leaf<TRow, TNode> {
  readonly id: string;
  readonly def: ColumnDef<TRow, TNode>;
  readonly index: number;
  readonly region: Region;
  readonly x: number;
  readonly width: number;
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly depth: number;
  readonly groupStart: boolean;
  readonly letter: string;
  getValue(row: TRow): unknown;
}

export interface HeaderCell<TRow, TNode> {
  readonly id: string;
  readonly def: ColumnDef<TRow, TNode>;
  readonly level: number;
  readonly rowSpan: number;
  readonly isGroup: boolean;
  readonly first: number;
  readonly last: number;
  readonly region: Region;
  readonly groupStart: boolean;
  readonly resizable: boolean;
}

interface ColumnNode<TRow, TNode> {
  readonly def: ColumnDef<TRow, TNode>;
  readonly depth: number;
  readonly children: ColumnNode<TRow, TNode>[];
  readonly parent: ColumnNode<TRow, TNode> | undefined;
  top: ColumnNode<TRow, TNode>;
}

interface PlacedLeaf<TRow, TNode> {
  node: ColumnNode<TRow, TNode>;
  region: Region;
  width: number;
  minWidth: number;
  maxWidth: number;
}

const limitsOf = (def: Pick<ColumnDef<unknown>, "minWidth" | "maxWidth">) => {
  const min = def.minWidth ?? MIN_COLUMN_WIDTH;
  return { min, max: Math.max(min, def.maxWidth ?? Number.POSITIVE_INFINITY) };
};

export const headerText = <TRow, TNode>(def: ColumnDef<TRow, TNode>): string =>
  def.headerText ?? (typeof def.header === "string" ? def.header : def.id);

const own = <T>(record: Readonly<Record<string, T>>, key: string): T | undefined =>
  Object.hasOwn(record, key) ? record[key] : undefined;

const valueGetter = <TRow>(def: ColumnDef<TRow, unknown>) => {
  if (def.getValue) return def.getValue;
  const { field } = def;
  if (field === undefined) return () => undefined;
  return (row: TRow) => row[field];
};

export class ColumnModel<TRow, TNode> implements AxisMetrics {
  readonly leaves: readonly Leaf<TRow, TNode>[];
  readonly headerRows: readonly (readonly HeaderCell<TRow, TNode>[])[];
  readonly widths: { readonly left: number; readonly center: number; readonly right: number };
  readonly centerStart: number;
  readonly centerEnd: number;
  private readonly nodes = new Map<string, ColumnNode<TRow, TNode>>();
  private readonly byId = new Map<string, number>();
  private readonly cellsById = new Map<string, HeaderCell<TRow, TNode>>();
  private readonly tops: ColumnNode<TRow, TNode>[];

  constructor(
    readonly defs: readonly ColumnDef<TRow, TNode>[],
    readonly state: ColumnState,
    availableWidth: number,
    gutterWidth = 0,
  ) {
    this.tops = defs.map((def) => this.addNode(def, 0, undefined));

    let placed = this.place(true, availableWidth - gutterWidth);
    const pinnedWidth = placed
      .filter((leaf) => leaf.region !== "center")
      .reduce((sum, leaf) => sum + leaf.width, gutterWidth);
    if (availableWidth > 0 && pinnedWidth > availableWidth) {
      placed = this.place(false, availableWidth - gutterWidth);
    }

    const regionX: Record<Region, number> = { left: gutterWidth, center: 0, right: 0 };
    const leaves: Leaf<TRow, TNode>[] = [];
    let previousTop: ColumnNode<TRow, TNode> | undefined;
    for (const [index, { node, region, width, minWidth, maxWidth }] of placed.entries()) {
      const startsTop = node.top !== previousTop;
      const regionStart = index === 0 || placed[index - 1].region !== region;
      const groupStart =
        startsTop &&
        !regionStart &&
        (node.top.children.length > 0 || (previousTop?.children.length ?? 0) > 0);
      previousTop = node.top;
      this.byId.set(node.def.id, index);
      leaves.push({
        id: node.def.id,
        def: node.def,
        index,
        region,
        x: regionX[region],
        width,
        minWidth,
        maxWidth,
        depth: node.depth,
        groupStart,
        letter: columnLetter(index),
        getValue: valueGetter(node.def as ColumnDef<TRow, unknown>),
      });
      regionX[region] += width;
    }
    this.leaves = leaves;
    this.widths = { left: regionX.left, center: regionX.center, right: regionX.right };
    const firstCenter = leaves.findIndex((leaf) => leaf.region === "center");
    this.centerStart = firstCenter < 0 ? leaves.length : firstCenter;
    this.centerEnd = this.centerStart + leaves.filter((leaf) => leaf.region === "center").length;
    this.headerRows = this.buildHeaderRows();
  }

  get count(): number {
    return this.centerEnd - this.centerStart;
  }

  get total(): number {
    return this.widths.center;
  }

  get canvasWidth(): number {
    return this.widths.left + this.widths.center + this.widths.right;
  }

  offsetOf(centerIndex: number): number {
    if (centerIndex >= this.count) return this.widths.center;
    return this.leaves[this.centerStart + Math.max(0, centerIndex)]?.x ?? 0;
  }

  indexAt(offset: number): number {
    if (this.count === 0) return -1;
    let low = 0;
    let high = this.count - 1;
    while (low < high) {
      const mid = (low + high + 1) >> 1;
      if (this.leaves[this.centerStart + mid].x <= offset) low = mid;
      else high = mid - 1;
    }
    return low;
  }

  indexOf(leafId: string): number {
    return this.byId.get(leafId) ?? -1;
  }

  topIdOf(id: string): string | undefined {
    return this.nodes.get(id)?.top.def.id;
  }

  parentIdOf(id: string): string | undefined {
    return this.nodes.get(id)?.parent?.def.id;
  }

  headerCell(id: string): HeaderCell<TRow, TNode> | undefined {
    return this.cellsById.get(id);
  }

  siblingsOf(id: string): HeaderCell<TRow, TNode>[] {
    const cell = this.cellsById.get(id);
    if (!cell) return [];
    const parent = this.parentIdOf(id);
    return this.headerRows[cell.level].filter(
      (candidate) => candidate.region === cell.region && this.parentIdOf(candidate.id) === parent,
    );
  }

  visibleLeavesUnder(id: string): Leaf<TRow, TNode>[] {
    const node = this.nodes.get(id);
    if (!node) return [];
    const ids = new Set(this.leafNodes(node).map((leaf) => leaf.def.id));
    return this.leaves.filter((leaf) => ids.has(leaf.id));
  }

  leafIdsUnder(id: string): string[] {
    const node = this.nodes.get(id);
    return node ? this.leafNodes(node).map((leaf) => leaf.def.id) : [];
  }

  clampWidth(id: string, width: number): number {
    const def = this.nodes.get(id)?.def;
    if (!def) return width;
    const { min, max } = limitsOf(def);
    return Math.min(max, Math.max(min, width));
  }

  pinOf(id: string): PinnedSide | undefined {
    const top = this.nodes.get(id)?.top;
    if (!top) return undefined;
    const pinned = own(this.state.columnPinning, top.def.id);
    if (pinned !== undefined) return pinned || undefined;
    return top.def.pinned ?? this.leafNodes(top).find((leaf) => leaf.def.pinned)?.def.pinned;
  }

  private addNode(
    def: ColumnDef<TRow, TNode>,
    depth: number,
    parent: ColumnNode<TRow, TNode> | undefined,
  ): ColumnNode<TRow, TNode> {
    if (this.nodes.has(def.id)) throw new Error(`DataGrid: duplicate column id "${def.id}"`);
    const node: ColumnNode<TRow, TNode> = {
      def,
      depth,
      children: [],
      parent,
      top: undefined as never,
    };
    node.top = parent?.top ?? node;
    this.nodes.set(def.id, node);
    for (const child of def.children ?? [])
      node.children.push(this.addNode(child, depth + 1, node));
    return node;
  }

  private leafNodes(node: ColumnNode<TRow, TNode>): ColumnNode<TRow, TNode>[] {
    return node.children.length === 0
      ? [node]
      : node.children.flatMap((child) => this.leafNodes(child));
  }

  private isVisible(node: ColumnNode<TRow, TNode>) {
    return own(this.state.columnVisibility, node.def.id) ?? !node.def.hidden;
  }

  private place(pinning: boolean, availableWidth: number): PlacedLeaf<TRow, TNode>[] {
    const byRegion: Record<Region, PlacedLeaf<TRow, TNode>[]> = { left: [], center: [], right: [] };
    for (const top of this.tops) {
      const region: Region = (pinning && this.pinOf(top.def.id)) || "center";
      for (const node of this.leafNodes(top)) {
        if (!this.isVisible(node)) continue;
        const { min, max } = limitsOf(node.def);
        const sized =
          own(this.state.columnSizing, node.def.id) ?? node.def.width ?? DEFAULT_COLUMN_WIDTH;
        byRegion[region].push({
          node,
          region,
          width: Math.round(Math.min(max, Math.max(min, sized))),
          minWidth: min,
          maxWidth: max,
        });
      }
    }

    const flexing = byRegion.center.filter(
      ({ node }) =>
        (node.def.flex ?? 0) > 0 && own(this.state.columnSizing, node.def.id) === undefined,
    );
    if (flexing.length > 0) {
      const fixed = [...byRegion.left, ...byRegion.center, ...byRegion.right]
        .filter((leaf) => !flexing.includes(leaf))
        .reduce((sum, leaf) => sum + leaf.width, 0);
      const sizes = distribute(
        Math.max(0, availableWidth - fixed),
        flexing.map(({ node, minWidth, maxWidth }) => ({
          weight: node.def.flex ?? 0,
          min: minWidth,
          max: maxWidth,
        })),
      );
      flexing.forEach((leaf, index) => {
        leaf.width = sizes[index];
      });
    }
    return [...byRegion.left, ...byRegion.center, ...byRegion.right];
  }

  private buildHeaderRows(): HeaderCell<TRow, TNode>[][] {
    const levelCount = this.leaves.reduce((max, leaf) => Math.max(max, leaf.depth + 1), 0);
    const rows: HeaderCell<TRow, TNode>[][] = Array.from({ length: levelCount }, () => []);
    const visit = (node: ColumnNode<TRow, TNode>) => {
      const leaves = this.visibleLeavesUnder(node.def.id);
      if (leaves.length === 0) return;
      const first = leaves[0];
      const isGroup = node.children.length > 0;
      const cell: HeaderCell<TRow, TNode> = {
        id: node.def.id,
        def: node.def,
        level: node.depth,
        rowSpan: isGroup ? 1 : levelCount - node.depth,
        isGroup,
        first: first.index,
        last: leaves[leaves.length - 1].index,
        region: first.region,
        groupStart: first.groupStart,
        resizable: leaves.some((leaf) => leaf.def.resizable !== false),
      };
      rows[node.depth].push(cell);
      this.cellsById.set(cell.id, cell);
      for (const child of node.children) visit(child);
    };
    for (const top of this.tops) visit(top);
    for (const row of rows) row.sort((a, b) => a.first - b.first);
    return rows;
  }
}
