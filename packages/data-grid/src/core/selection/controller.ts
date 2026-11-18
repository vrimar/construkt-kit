import type { ColumnModel } from "../columns/columnModel";
import type { CellRenderContext, ColumnDef } from "../columns/types";
import type { RowModel } from "../rows/rowModel";
import type { RowId, RowNode } from "../rows/rowNode";
import type { SourceStore } from "../rows/sourceStore";
import type { SpanIndex } from "../spans/spanIndex";
import { type Channels, SHARED_CHANNELS } from "../store/channels";
import { ControlledValue } from "../store/controlled";
import { type SelectMode, cascadeRows, partialRows, selectIds } from "./entities";
import {
  type CellPosition,
  EXTEND_MOVES,
  type ExtendCommand,
  type NavigationCommand,
  navigate,
} from "./navigation";
import {
  type BlockLayout,
  type IndexRect,
  copyLayout,
  expandToSpans,
  rectBetween,
  rectContains,
  rectLayout,
} from "./ranges";
import { StatsAccumulator } from "./stats";
import type {
  CellAddress,
  CellRange,
  EntityKind,
  EntitySelection,
  RangeStats,
  SelectionDetails,
} from "./types";

export type SelectionMode = "multiple" | "single" | "none";

export interface SelectionOptions<TRow> {
  /** Selected rows, columns or column groups. Controlled when given, `null` included. */
  selection?: EntitySelection | null;
  defaultSelection?: EntitySelection | null;
  onSelectionChange?: (selection: EntitySelection | null) => void;
  isRowSelectable?: (row: TRow) => boolean;
  /** Defaults to `"multiple"`; `"none"` stops headers, the gutter and checkboxes selecting. */
  selectionMode?: SelectionMode;
  /** Cell ranges. Controlled when given; a drag calls `onCellSelectionChange` once, on release. */
  cellSelection?: readonly CellRange[];
  onCellSelectionChange?: (ranges: readonly CellRange[]) => void;
  /** Called once a click, drag or key that selects has finished. */
  onSelectionEnd?: (details: SelectionDetails) => void;
  /** Adds a pinned checkbox column that selects rows; Space toggles the active row. */
  checkboxSelection?: boolean;
}

export interface SelectionHost<TRow, TNode> {
  readonly rowModel: RowModel<TRow>;
  readonly columns: ColumnModel<TRow, TNode>;
  readonly spans: SpanIndex<TRow, TNode>;
  readonly channels: Channels;
  readonly pinnedTop: SourceStore<TRow>;
  readonly pinnedBottom: SourceStore<TRow>;
  readonly rowCount: number;
  readonly isTree: boolean;
  sourceNodes(): readonly RowNode<TRow>[];
  sourceNode(id: RowId): RowNode<TRow> | undefined;
  isFullWidthNode(node: RowNode<TRow>): boolean;
  activePosition(): CellPosition | null;
  setActiveCell(position: CellPosition, options?: { reveal?: boolean }): void;
  positionOf(address: CellAddress): CellPosition | null;
  addressOf(position: CellPosition): CellAddress | null;
  scrollToCell(position: CellPosition): void;
  cellText(node: RowNode<TRow>, rowIndex: number, columnIndex: number): string;
  pageRows(): number;
}

export const SELECTION_CHANNELS = {
  selection: "selection",
  ranges: "ranges",
} as const;

export type RowSelectionState = boolean | "mixed";

const NO_RANGES: readonly CellRange[] = [];

const STEPS: ReadonlySet<NavigationCommand> = new Set([
  "moveUp",
  "moveDown",
  "moveLeft",
  "moveRight",
]);

interface Cached {
  key: string;
  stats: RangeStats | null;
  allRows: RowSelectionState | null;
  columns: ReadonlySet<number> | null;
}

interface BlockRow<TRow> {
  node: RowNode<TRow>;
  index: number;
}

interface Block<TRow> {
  rows: BlockRow<TRow>[];
  columns: number[];
}

export class GridSelection<TRow, TNode> {
  private readonly entities: ControlledValue<EntitySelection | null>;
  private readonly committed = new ControlledValue<readonly CellRange[]>(NO_RANGES);
  private transient: readonly CellRange[] | null = null;
  private readonly anchors = new Map<EntityKind, RowId>();
  private partial: {
    source: EntitySelection | null;
    version: number;
    rows: ReadonlySet<RowId>;
  } | null = null;
  private cached: Cached = { key: "", stats: null, allRows: null, columns: null };
  private optionsVersion = 0;
  private readonly resolved = new WeakMap<
    readonly CellRange[],
    { key: string; rects: IndexRect[] }
  >();

  constructor(
    private readonly host: SelectionHost<TRow, TNode>,
    private readonly options: () => SelectionOptions<TRow>,
    initial: EntitySelection | null,
  ) {
    this.entities = new ControlledValue<EntitySelection | null>(initial);
  }

  sync(options: SelectionOptions<TRow>, previous: SelectionOptions<TRow>): void {
    if (
      options.selectionMode !== previous.selectionMode ||
      options.isRowSelectable !== previous.isRowSelectable
    ) {
      this.optionsVersion++;
    }
    const before = this.entities.value;
    const beforeRanges = this.committed.value;
    this.entities.controlled = options.selection;
    this.committed.controlled = options.cellSelection;
    if (this.entities.value !== before) this.host.channels.notify(SELECTION_CHANNELS.selection);
    if (this.committed.value !== beforeRanges) {
      this.host.channels.notify(SELECTION_CHANNELS.selection);
      this.notifyRanges();
    }
  }

  get rowStateVersion(): number {
    const { channels } = this.host;
    return (
      channels.version(SELECTION_CHANNELS.selection) +
      channels.version(SHARED_CHANNELS.rows) +
      this.optionsVersion
    );
  }

  get mode(): SelectionMode {
    return this.options().selectionMode ?? "multiple";
  }

  get selection(): EntitySelection | null {
    return this.entities.value;
  }

  get ranges(): readonly CellRange[] {
    return this.transient ?? this.committed.value;
  }

  get details(): SelectionDetails {
    return { selection: this.selection, cellSelection: this.committed.value };
  }

  isRowSelectable(node: RowNode<TRow>): boolean {
    if (this.mode === "none" || this.host.isFullWidthNode(node)) return false;
    return this.options().isRowSelectable?.(node.data) ?? true;
  }

  select(kind: EntityKind, id: RowId, mode: SelectMode): void {
    if (this.mode === "none") return;
    const current = this.selection;
    const same = current?.kind === kind ? current.ids : [];
    let ids = selectIds(same, id, mode, {
      anchor: this.anchors.get(kind),
      order: this.orderFor(kind, id),
      single: this.mode === "single",
    });
    if (this.cascades(kind)) {
      const alone = this.cascade([], [id]);
      const replacing = mode === "replace" && sameMembers(same, alone);
      ids = replacing ? [] : this.cascade(mode === "toggle" ? same : [], ids);
    }
    if (mode !== "range") this.anchors.set(kind, id);
    this.setSelection(ids.length === 0 ? null : ({ kind, ids } as EntitySelection));
  }

  setSelection(next: EntitySelection | null): void {
    if (next === this.selection) return;
    this.host.channels.batch(() => {
      this.applySelection(next);
      if (this.committed.value.length > 0) this.commitRanges(NO_RANGES);
    });
  }

  private applySelection(next: EntitySelection | null) {
    this.entities.set(next);
    this.options().onSelectionChange?.(next);
    this.host.channels.notify(SELECTION_CHANNELS.selection);
  }

  selectAllRows(on: boolean): void {
    if (this.mode !== "multiple") return;
    const ids = on ? this.selectableRowIds() : [];
    this.setSelection(ids.length === 0 ? null : { kind: "rows", ids });
  }

  allRowsState(): RowSelectionState {
    const selection = this.selection;
    if (selection?.kind !== "rows" || selection.ids.length === 0) return false;
    const cache = this.cache();
    if (cache.allRows === null) {
      const selected = new Set(selection.ids);
      const selectable = this.selectableRowIds();
      cache.allRows =
        selectable.length > 0 && selectable.every((id) => selected.has(id)) ? true : "mixed";
    }
    return cache.allRows;
  }

  private selectableRowIds(): RowId[] {
    const { pinnedTop, pinnedBottom } = this.host;
    return [...pinnedTop.nodes, ...this.host.sourceNodes(), ...pinnedBottom.nodes]
      .filter((node) => this.isRowSelectable(node))
      .map((node) => node.id);
  }

  private cache() {
    const { channels } = this.host;
    const key = `${channels.version(SELECTION_CHANNELS.selection)}:${channels.version(SHARED_CHANNELS.rows)}:${channels.version(SHARED_CHANNELS.geometry)}`;
    if (this.cached.key !== key) this.cached = { key, stats: null, allRows: null, columns: null };
    return this.cached;
  }

  rowState(node: RowNode<TRow>): RowSelectionState {
    const selection = this.selection;
    if (selection?.kind !== "rows") return false;
    if (selection.ids.includes(node.id)) return true;
    if (!this.host.isTree) return false;
    const version = this.host.channels.version(SHARED_CHANNELS.rows);
    if (this.partial?.source !== selection || this.partial.version !== version) {
      this.partial = {
        source: selection,
        version,
        rows: partialRows(selection.ids, this.host.rowModel),
      };
    }
    return this.partial.rows.has(node.id) ? "mixed" : false;
  }

  selectedColumns(): number[] {
    const selection = this.selection;
    if (!selection || selection.kind === "rows") return [];
    const { columns } = this.host;
    const indices =
      selection.kind === "columns"
        ? selection.ids.map((id) => columns.indexOf(id))
        : selection.ids.flatMap((id) => columns.visibleLeavesUnder(id).map((leaf) => leaf.index));
    return [...new Set(indices.filter((index) => index >= 0))].sort((a, b) => a - b);
  }

  isColumnSelected(column: number): boolean {
    const cache = this.cache();
    cache.columns ??= new Set(this.selectedColumns());
    return cache.columns.has(column);
  }

  isSpanSelected(first: number, last: number): boolean {
    for (let column = first; column <= last; column++) {
      if (!this.isColumnSelected(column)) return false;
    }
    return true;
  }

  isHeaderSelectable(def: ColumnDef<TRow, TNode>): boolean {
    return this.mode !== "none" && def.selectable !== false;
  }

  isHeaderSelected(id: string, isGroup: boolean): boolean {
    const selection = this.selection;
    if (!selection) return false;
    return selection.kind === (isGroup ? "groups" : "columns") && selection.ids.includes(id);
  }

  headerMenuIds(id: string, isGroup: boolean): readonly string[] {
    const selection = this.selection;
    return selection && this.isHeaderSelected(id, isGroup)
      ? (selection.ids as readonly string[])
      : [id];
  }

  cellMenuTargets(ctx: CellRenderContext<TRow>): {
    rowIds: readonly RowId[];
    columnIds: readonly string[];
    ranges: readonly CellRange[];
  } {
    const selection = this.selection;
    const rowIds =
      selection?.kind === "rows" && selection.ids.includes(ctx.rowId) ? selection.ids : [ctx.rowId];
    let columnIds: readonly string[] = [ctx.columnId];
    if (selection && selection.kind !== "rows") {
      const selected = this.selectedColumns();
      if (selected.includes(ctx.columnIndex)) {
        columnIds = selected.map((index) => this.host.columns.leaves[index].id);
      }
    }
    const inRange = this.rangeRects().some((rect) =>
      rectContains(rect, { row: ctx.rowIndex, column: ctx.columnIndex }),
    );
    const cell = { rowId: ctx.rowId, columnId: ctx.columnId };
    return { rowIds, columnIds, ranges: inRange ? this.ranges : [{ start: cell, end: cell }] };
  }

  rangeRects(ranges: readonly CellRange[] = this.ranges): IndexRect[] {
    const { channels } = this.host;
    const key = `${channels.version(SHARED_CHANNELS.rows)}:${channels.version(SHARED_CHANNELS.geometry)}`;
    const cached = this.resolved.get(ranges);
    if (cached?.key === key) return cached.rects;
    const rects: IndexRect[] = [];
    for (const range of ranges) {
      const rect = this.rectOf(range);
      if (rect) rects.push(rect);
    }
    this.resolved.set(ranges, { key, rects });
    return rects;
  }

  inCommittedRange(row: number, column: number): boolean {
    return this.rangeRects(this.committed.value).some((rect) =>
      rectContains(rect, { row, column }),
    );
  }

  rangeColumnsKey(row: number): string {
    return this.rangeRects(this.committed.value)
      .filter((rect) => row >= rect.top && row <= rect.bottom)
      .map((rect) => `${rect.left}-${rect.right}`)
      .join(",");
  }

  pressCell(position: CellPosition, { extend, add }: { extend: boolean; add: boolean }): void {
    const active = this.host.activePosition();
    const cell = this.host.addressOf(position);
    if (!cell) return;
    if (extend && active) {
      const start = this.host.addressOf(active);
      if (!start) return;
      const kept = add ? this.committed.value.slice(0, -1) : NO_RANGES;
      this.transient = [...kept, { start, end: cell }];
    } else {
      this.host.setActiveCell(position, { reveal: false });
      this.transient = add
        ? [...this.withActiveRange(active), { start: cell, end: cell }]
        : NO_RANGES;
    }
    this.notifyRanges();
  }

  dragTo(position: CellPosition): void {
    const ranges = this.transient ?? this.committed.value;
    const end = this.host.addressOf(position);
    const active = this.host.activePosition();
    const last = ranges.at(-1);
    const start = last?.start ?? (active ? this.host.addressOf(active) : null);
    if (!end || !start) return;
    if (last ? sameAddress(last.end, end) : sameAddress(start, end)) return;
    const kept = ranges.slice(0, -1);
    this.transient =
      sameAddress(start, end) && kept.length === 0 ? NO_RANGES : [...kept, { start, end }];
    this.notifyRanges();
  }

  dragHandle(fixed: CellPosition, moving: CellPosition): void {
    const start = this.host.addressOf(fixed);
    const end = this.host.addressOf(moving);
    if (!start || !end) return;
    const ranges = this.transient ?? this.committed.value;
    const last = ranges.at(-1);
    if (last && sameAddress(last.start, start) && sameAddress(last.end, end)) return;
    this.transient = [...this.committed.value.slice(0, -1), { start, end }];
    this.notifyRanges();
  }

  releaseDrag(cancelled = false): void {
    const transient = this.transient;
    this.transient = null;
    if (transient === null) return;
    if (cancelled || sameRanges(transient, this.committed.value)) this.notifyRanges();
    else this.commitRanges(transient);
    if (!cancelled) this.end();
  }

  extend(command: ExtendCommand): boolean {
    const active = this.host.activePosition();
    if (!active) return false;
    const ranges = this.committed.value;
    const last = ranges.at(-1);
    const start = (last && this.host.positionOf(last.start)) || active;
    const end = (last && this.host.positionOf(last.end)) || active;
    const next = this.extendedEnd(command, start, end);
    const startAddress = this.host.addressOf(start);
    const endAddress = this.host.addressOf(next);
    if (!startAddress || !endAddress) return false;
    this.commitRanges([...ranges.slice(0, -1), { start: startAddress, end: endAddress }]);
    this.host.scrollToCell(next);
    this.end();
    return true;
  }

  private extendedEnd(command: ExtendCommand, start: CellPosition, end: CellPosition) {
    const move = EXTEND_MOVES[command];
    const bounds = {
      rowCount: this.host.rowCount,
      columnCount: this.host.columns.leaves.length,
      pageRows: this.host.pageRows(),
    };
    const before = this.expandedRect(start, end);
    let next = end;
    for (;;) {
      const moved = navigate(move, next, bounds);
      if (!moved || (moved.row === next.row && moved.column === next.column)) return next;
      next = moved;
      if (!STEPS.has(move) || !sameRect(this.expandedRect(start, next), before)) return next;
    }
  }

  private expandedRect(start: CellPosition, end: CellPosition): IndexRect {
    const rect = rectBetween(start, end);
    return this.host.spans.active ? expandToSpans(rect, this.spanAt) : rect;
  }

  selectAllCells(): boolean {
    const { rowCount } = this.host;
    const columnCount = this.host.columns.leaves.length;
    const start = this.host.addressOf({ row: 0, column: 0 });
    const end = this.host.addressOf({ row: rowCount - 1, column: columnCount - 1 });
    if (!start || !end) return false;
    this.commitRanges([{ start, end }]);
    this.end();
    return true;
  }

  selectCovered(kind: "rows" | "columns"): boolean {
    if (this.mode === "none") return false;
    const active = this.host.activePosition();
    if (!active) return false;
    const rects = this.rangeRects();
    const areas = rects.length > 0 ? rects : [rectBetween(active, active)];
    const ids: RowId[] = [];
    for (const rect of areas) {
      if (kind === "rows") {
        for (let row = rect.top; row <= rect.bottom; row++) {
          const node = this.host.rowModel.nodeAt(row);
          if (this.isRowSelectable(node)) ids.push(node.id);
        }
      } else {
        for (let column = rect.left; column <= rect.right; column++) {
          const leaf = this.host.columns.leaves[column];
          if (this.isHeaderSelectable(leaf.def)) ids.push(leaf.id);
        }
      }
    }
    const unique = [...new Set(ids)];
    const single = this.mode === "single" ? unique.slice(0, 1) : unique;
    const next = this.cascades(kind) ? this.cascade([], single) : single;
    this.setSelection(next.length === 0 ? null : ({ kind, ids: next } as EntitySelection));
    this.end();
    return true;
  }

  toggleActiveRow(): boolean {
    const active = this.host.activePosition();
    if (!this.options().checkboxSelection || !active) return false;
    const node = this.host.rowModel.nodeAt(active.row);
    if (!this.isRowSelectable(node)) return false;
    this.select("rows", node.id, "toggle");
    this.end();
    return true;
  }

  clear(): boolean {
    const hadSelection = this.selection !== null;
    const hadRanges = this.committed.value.length > 0;
    if (!hadSelection && !hadRanges) return false;
    this.host.channels.batch(() => {
      if (hadSelection) this.applySelection(null);
      if (hadRanges) this.commitRanges(NO_RANGES);
    });
    this.end();
    return true;
  }

  collapseRanges(): void {
    this.transient = null;
    if (this.committed.value.length > 0) this.commitRanges(NO_RANGES);
  }

  copyCells(): string[][] | null {
    const block = this.copyBlock();
    if (!block) return null;
    const lines = block.rows.map(() => block.columns.map(() => ""));
    this.forEachCell(block, (node, row, column, line, field) => {
      lines[line][field] = this.host.cellText(node, row, column);
    });
    return lines;
  }

  stats(): RangeStats | null {
    const cache = this.cache();
    cache.stats ??= this.computeStats();
    return cache.stats;
  }

  private computeStats(): RangeStats | null {
    const rects = this.rangeRects(this.committed.value);
    const accumulator = new StatsAccumulator();
    const { leaves } = this.host.columns;
    const add = (node: RowNode<TRow>, column: number) =>
      accumulator.add(leaves[column].getValue(node.data));
    if (rects.length > 0) {
      rects.forEach((rect, index) => {
        const earlier = rects.slice(0, index);
        this.forEachCell(this.block(rectLayout(rect)), (node, row, column) => {
          if (!earlier.some((other) => rectContains(other, { row, column }))) add(node, column);
        });
      });
    } else {
      const entity = this.selection && this.entityBlock(this.selection);
      if (!entity) return null;
      this.forEachCell(entity, (node, _row, column) => add(node, column));
    }
    return accumulator.result();
  }

  end(): void {
    this.options().onSelectionEnd?.({
      selection: this.entities.latest,
      cellSelection: this.committed.latest,
    });
  }

  private forEachCell(
    block: Block<TRow>,
    visit: (node: RowNode<TRow>, row: number, column: number, line: number, field: number) => void,
  ): void {
    const { spans } = this.host;
    const inBlock = spans.active && {
      rows: new Set(block.rows.map((row) => row.index)),
      columns: new Set(block.columns),
    };
    block.rows.forEach(({ node, index }, line) => {
      block.columns.forEach((column, field) => {
        if (inBlock && index >= 0) {
          const span = spans.spanAt(index, column);
          const covered = span.row !== index || span.column !== column;
          if (covered && inBlock.rows.has(span.row) && inBlock.columns.has(span.column)) return;
        }
        visit(node, index, column, line, field);
      });
    });
  }

  private block({ rows, columns }: BlockLayout): Block<TRow> {
    return {
      rows: rows.map((index) => ({ node: this.host.rowModel.nodeAt(index), index })),
      columns,
    };
  }

  private copyBlock(): Block<TRow> | null {
    const rects = this.rangeRects();
    if (rects.length > 0) {
      const layout = copyLayout(rects);
      return layout && this.block(layout);
    }
    if (this.selection) return this.entityBlock(this.selection);
    const active = this.host.activePosition();
    return active ? this.block({ rows: [active.row], columns: [active.column] }) : null;
  }

  private entityBlock(selection: EntitySelection): Block<TRow> | null {
    const { rowModel, columns } = this.host;
    if (selection.kind !== "rows") {
      const rows = Array.from({ length: rowModel.rowCount }, (_, index) => index);
      return this.block({ rows, columns: this.selectedColumns() });
    }
    const ids = new Set(selection.ids);
    const pinned = (store: SourceStore<TRow>) =>
      store.nodes.filter((node) => ids.has(node.id)).map((node) => ({ node, index: -1 }));
    const body = this.block({
      rows: selection.ids
        .map((id) => rowModel.indexOf(id))
        .filter((index) => index >= 0)
        .sort((a, b) => a - b),
      columns: columns.leaves.map((leaf) => leaf.index),
    });
    const rows = [...pinned(this.host.pinnedTop), ...body.rows, ...pinned(this.host.pinnedBottom)];
    return rows.length > 0 ? { rows, columns: body.columns } : null;
  }

  private commitRanges(next: readonly CellRange[]): void {
    this.transient = null;
    this.committed.set(next);
    this.options().onCellSelectionChange?.(next);
    this.host.channels.batch(() => {
      this.host.channels.notify(SELECTION_CHANNELS.selection);
      this.notifyRanges();
    });
  }

  private notifyRanges() {
    this.host.channels.notify(SELECTION_CHANNELS.ranges);
  }

  private withActiveRange(active: CellPosition | null): readonly CellRange[] {
    const ranges = this.committed.value;
    if (ranges.length > 0 || !active) return ranges;
    const cell = this.host.addressOf(active);
    return cell ? [{ start: cell, end: cell }] : NO_RANGES;
  }

  private readonly spanAt = (row: number, column: number) => this.host.spans.spanAt(row, column);

  private rectOf(range: CellRange): IndexRect | null {
    const start = this.host.positionOf(range.start);
    const end = this.host.positionOf(range.end);
    return start && end ? this.expandedRect(start, end) : null;
  }

  private orderFor(kind: EntityKind, id: RowId): RowId[] {
    const { rowModel, columns } = this.host;
    if (kind === "rows") {
      const order: RowId[] = [];
      for (let index = 0; index < rowModel.rowCount; index++) {
        const node = rowModel.nodeAt(index);
        if (this.isRowSelectable(node)) order.push(node.id);
      }
      return order;
    }
    if (kind === "columns") {
      return columns.leaves
        .filter((leaf) => this.isHeaderSelectable(leaf.def))
        .map((leaf) => leaf.id);
    }
    const level = columns.headerCell(String(id))?.level;
    return (level === undefined ? [] : columns.headerRows[level])
      .filter((cell) => cell.isGroup && this.isHeaderSelectable(cell.def))
      .map((cell) => cell.id);
  }

  private cascades(kind: EntityKind): boolean {
    return kind === "rows" && this.host.isTree && this.mode === "multiple";
  }

  private cascade(previous: readonly RowId[], requested: readonly RowId[]): RowId[] {
    return cascadeRows(new Set(previous), requested, this.host.rowModel, (id) =>
      this.rowIdSelectable(id),
    );
  }

  private rowIdSelectable(id: RowId): boolean {
    const node = this.host.sourceNode(id);
    return node ? this.isRowSelectable(node) : false;
  }
}

const sameMembers = (a: readonly RowId[], b: readonly RowId[]) => {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((id) => set.has(id));
};

const sameAddress = (a: CellAddress, b: CellAddress) =>
  a.rowId === b.rowId && a.columnId === b.columnId;

const sameRanges = (a: readonly CellRange[], b: readonly CellRange[]) =>
  a.length === b.length &&
  a.every(
    (range, index) =>
      sameAddress(range.start, b[index].start) && sameAddress(range.end, b[index].end),
  );

const sameRect = (a: IndexRect, b: IndexRect) =>
  a.top === b.top && a.left === b.left && a.bottom === b.bottom && a.right === b.right;
