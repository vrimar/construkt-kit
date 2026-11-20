import { encodeHtml, encodeTsv } from "./clipboard/encode";
import { formatCellValue, mergeCellSpecs } from "./columns/cellSpec";
import { type ColumnState, ColumnModel, type HeaderCell, type Region } from "./columns/columnModel";
import type {
  CellContext,
  CellRenderContext,
  CellSpec,
  CellTone,
  ColumnDef,
  ColumnPinning,
  HeaderContext,
  ColumnSizing,
  ColumnVisibility,
  PinnedSide,
  RowContext,
  RowSizing,
} from "./columns/types";
import type { BuiltInCommand } from "./commands/keymap";
import { type CommandHandler, CommandRegistry } from "./commands/registry";
import { DND_CHANNELS, type DndOptions, GridDnd, type RowGeometry } from "./dnd/controller";
import { EDITING_CHANNEL, type EditingOptions, GridEditing } from "./editing/controller";
import { AxisWindow } from "./layout/axisWindow";
import type { CoreHit, HitBox, HitRegion } from "./layout/hit";
import { OffsetIndex } from "./layout/offsetIndex";
import { type ScrollMapping, createScrollMapping } from "./layout/scrollMapping";
import { type StickyRow, stickyParents } from "./layout/sticky";
import type { MenuAnchorEvent, MenuEntry } from "./menu";
import { ClientRowModel, type RowModel } from "./rows/rowModel";
import type { RowId, RowNode } from "./rows/rowNode";
import { SourceStore } from "./rows/sourceStore";
import { GridSelection, SELECTION_CHANNELS, type SelectionOptions } from "./selection/controller";
import {
  type CellPosition,
  EXTEND_COMMANDS,
  NAVIGATION_COMMANDS,
  type NavigationCommand,
  navigate,
} from "./selection/navigation";
import { type IndexRect, rectContains } from "./selection/ranges";
import type { CellAddress, FlashTargets, GridTarget } from "./selection/types";
import { SpanIndex } from "./spans/spanIndex";
import {
  type DataGridState,
  STATE_CALLBACKS,
  STATE_KEYS,
  type StateKey,
  type StateOptions,
  type StateSlices,
  migrateState,
  sameSlice,
  toSnapshot,
} from "./state/snapshot";
import { Channels, SHARED_CHANNELS } from "./store/channels";
import { ControlledValue } from "./store/controlled";

export interface GridOptions<TRow, TNode>
  extends SelectionOptions<TRow>, DndOptions<TRow>, EditingOptions<TRow>, StateOptions {
  /** Rows in display order. A new array diffs by `getRowId`; unchanged row objects don't re-render. */
  rows: readonly TRow[];
  getRowId: (row: TRow) => RowId;
  columnDefs: readonly ColumnDef<TRow, TNode>[];
  /**
   * Height in px; `undefined` uses the size's row height. Heights are known up front, never measured.
   * A new function re-reads every row's height, so keep it stable.
   */
  getRowHeight?: (row: TRow) => number | undefined;
  defaultCell?: CellSpec<TRow, TNode>;
  /** Cell-scope `CellSpec`. A new function re-renders every mounted row, so keep it stable. */
  getCell?: (ctx: CellContext<TRow>) => CellSpec<TRow, TNode> | undefined;
  /** Header row height in px, or one per header level from the top. Defaults to the size's header height. */
  headerHeight?: number | readonly number[];
  /** Shows a row of column letters (A, B, …) above the headers. */
  columnLetters?: boolean;
  /** Makes rows a tree: a row whose parent id matches another row's id nests under it. */
  getParentId?: (row: TRow) => RowId | null | undefined;
  /** Rows drawn as one cell across the grid, kept in view while scrolling sideways. */
  isFullWidthRow?: (row: TRow) => boolean;
  /** Rows held under the header or above the bottom edge; they don't scroll. */
  pinnedTopRows?: readonly TRow[];
  pinnedBottomRows?: readonly TRow[];
  defaultExpandedRowIds?: readonly RowId[];
}

export const GRID_OPTION_KEYS: Readonly<Record<keyof GridOptions<unknown, unknown>, true>> = {
  rows: true,
  getRowId: true,
  columnDefs: true,
  getRowHeight: true,
  defaultCell: true,
  getCell: true,
  headerHeight: true,
  columnLetters: true,
  getParentId: true,
  isFullWidthRow: true,
  pinnedTopRows: true,
  pinnedBottomRows: true,
  defaultExpandedRowIds: true,
  selection: true,
  defaultSelection: true,
  onSelectionChange: true,
  isRowSelectable: true,
  selectionMode: true,
  cellSelection: true,
  onCellSelectionChange: true,
  onSelectionEnd: true,
  checkboxSelection: true,
  onRowsDrop: true,
  onColumnsDrop: true,
  canDropOnto: true,
  canDropBetween: true,
  canDropAcross: true,
  onDropAcross: true,
  isRowReorderable: true,
  indicator: true,
  dragHandles: true,
  onKeyboardMove: true,
  onCellsChange: true,
  onHeaderRename: true,
  columnSizing: true,
  onColumnSizingChange: true,
  columnPinning: true,
  onColumnPinningChange: true,
  columnVisibility: true,
  onColumnVisibilityChange: true,
  expandedRowIds: true,
  onExpandedRowIdsChange: true,
  rowSizing: true,
  onRowSizingChange: true,
  onStateChange: true,
};

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PinnedRow<TRow> {
  node: RowNode<TRow>;
  top: number;
  height: number;
}

export interface MenuRequest<TNode> {
  target: GridTarget;
  anchor: unknown;
  point: { x: number; y: number } | null;
  entries: readonly MenuEntry<TNode>[];
  fromKeyboard: boolean;
}

export interface Flash {
  id: number;
  rows: readonly RowId[];
  columns: readonly string[];
  cells: readonly CellAddress[];
  kind: CellTone;
}

export interface VisibleRange {
  firstRowId: RowId;
  lastRowId: RowId;
  firstIndex: number;
  lastIndex: number;
}

export interface ResolvedCell<TRow, TNode> {
  spec: CellSpec<TRow, TNode>;
  ctx: CellRenderContext<TRow>;
}

export interface ScrollRequest {
  top?: number;
  left?: number;
}

interface Anchor {
  ids: RowId[];
  delta: number;
}

export const GRID_CHANNELS = {
  ...SHARED_CHANNELS,
  window: "window",
  origin: "origin",
  active: "active",
  scroll: "scroll",
  sticky: "sticky",
  range: "range",
  menu: "menu",
  flash: "flash",
  editing: EDITING_CHANNEL,
  ...DND_CHANNELS,
  ...SELECTION_CHANNELS,
} as const;

const NO_ROWS: readonly never[] = [];
const MIN_ROW_HEIGHT = 16;

const FALLBACK_ROW_HEIGHT = 36;
const MIN_OVERSCAN = 100;
const ROW_OVERSCAN = 0.5;
const COLUMN_OVERSCAN = 0.25;
const ORIGIN_STEP = 1_000_000;

export class GridCore<TRow, TNode = unknown> {
  readonly channels = new Channels();
  readonly commands = new CommandRegistry();
  readonly rowModel: RowModel<TRow>;
  readonly pinnedTop = new SourceStore<TRow>();
  readonly pinnedBottom = new SourceStore<TRow>();
  columns: ColumnModel<TRow, TNode> = new ColumnModel<TRow, TNode>(
    [],
    { columnSizing: {}, columnPinning: {}, columnVisibility: {} },
    0,
  );

  private active: CellAddress | null = null;
  private readonly source = new SourceStore<TRow>();
  private readonly offsets = new OffsetIndex();
  private readonly rowWindow = new AxisWindow();
  private readonly columnWindow = new AxisWindow();
  private options: GridOptions<TRow, TNode>;
  private defaultRowHeight = FALLBACK_ROW_HEIGHT;
  private headerHeight = FALLBACK_ROW_HEIGHT;
  private viewportWidth = 0;
  private viewportHeight = 0;
  private scrollTop = 0;
  private scrollLeft = 0;
  private contentTop = 0;
  private mapping: ScrollMapping = createScrollMapping(0, 0);
  private origin = 0;
  private bandOffset = 0;
  private lastActive: CellPosition = { row: 0, column: 0 };
  private pendingScroll: ScrollRequest | null = null;
  private gutterWidth = 0;
  private readonly state: { [K in StateKey]: ControlledValue<StateSlices[K]> } = {
    columnSizing: new ControlledValue<ColumnSizing>({}),
    columnPinning: new ControlledValue<ColumnPinning>({}),
    columnVisibility: new ControlledValue<ColumnVisibility>({}),
    expandedRowIds: new ControlledValue<readonly RowId[]>([]),
    rowSizing: new ControlledValue<RowSizing>({}),
  };
  private columnInputs: readonly unknown[] = [];
  private expandedSet: ReadonlySet<RowId> = new Set();
  private readonly transientHeights = new Map<RowId, number>();
  private transientWidths: ColumnSizing | null = null;
  private rowInputs: readonly unknown[] = [];
  private readonly clientModel: ClientRowModel<TRow>;
  private spanIndex: SpanIndex<TRow, TNode> | null = null;
  private sticky: StickyRow[] = [];
  private range: VisibleRange | null = null;
  private menu: MenuRequest<TNode> | null = null;
  private flashList: readonly Flash[] = [];
  private flashId = 0;
  private readonly headerContexts = new Map<string, HeaderContext<TRow, TNode>>();
  readonly selection: GridSelection<TRow, TNode>;
  readonly dnd: GridDnd<TRow, TNode>;
  readonly editing: GridEditing<TRow, TNode>;

  constructor(options: GridOptions<TRow, TNode>) {
    this.options = options;
    this.clientModel = new ClientRowModel(this.source);
    this.rowModel = this.clientModel;
    this.state.expandedRowIds.set(options.defaultExpandedRowIds ?? []);
    this.selection = new GridSelection<TRow, TNode>(
      this,
      () => this.options,
      options.defaultSelection ?? null,
    );
    this.dnd = new GridDnd<TRow, TNode>(this, () => this.options);
    this.editing = new GridEditing<TRow, TNode>(this, () => this.options);
    this.registerCommands();
    this.setOptions(options);
  }

  setOptions(options: GridOptions<TRow, TNode>): void {
    const previous = this.options;
    this.options = options;
    for (const key of STATE_KEYS) this.control(key, options);
    if (
      options.dragHandles !== previous.dragHandles ||
      (options.onColumnsDrop === undefined) !== (previous.onColumnsDrop === undefined)
    ) {
      this.headerContexts.clear();
    }
    this.channels.batch(() => {
      this.selection.sync(options, previous);
      this.dnd.sync(options, previous);
      this.refreshColumns();
      if (
        options.headerHeight !== previous.headerHeight ||
        options.columnLetters !== previous.columnLetters
      ) {
        this.channels.notify(GRID_CHANNELS.geometry);
      }
      if (options.defaultCell !== previous.defaultCell || options.getCell !== previous.getCell) {
        this.channels.notify(GRID_CHANNELS.cells);
      }
      this.refreshRows();
      const pinnedTop = this.pinnedTop.setRows(options.pinnedTopRows ?? NO_ROWS, options.getRowId);
      const pinnedBottom = this.pinnedBottom.setRows(
        options.pinnedBottomRows ?? NO_ROWS,
        options.getRowId,
      );
      if (pinnedTop || pinnedBottom) this.channels.notify(GRID_CHANNELS.rows);
      this.updateWindow();
    });
  }

  setViewport(width: number, height: number): void {
    if (width === this.viewportWidth && height === this.viewportHeight) return;
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.channels.batch(() => {
      this.refreshColumns();
      this.updateWindow();
    });
  }

  setGutterWidth(width: number): void {
    const next = Math.max(0, Math.round(width));
    if (next === this.gutterWidth) return;
    this.gutterWidth = next;
    this.channels.batch(() => {
      this.refreshColumns();
      this.updateWindow();
    });
  }

  setHeaderHeight(height: number): void {
    const next = Math.max(1, Math.round(height));
    if (next === this.headerHeight) return;
    this.headerHeight = next;
    this.channels.batch(() => {
      this.channels.notify(GRID_CHANNELS.geometry);
      this.updateWindow();
    });
  }

  setDefaultRowHeight(height: number): void {
    const next = Math.max(1, Math.round(height));
    if (next === this.defaultRowHeight) return;
    this.defaultRowHeight = next;
    this.channels.batch(() => {
      const anchor = this.captureAnchor();
      this.resetHeights(0);
      this.rowWindow.invalidate();
      this.restoreAnchor(anchor);
      this.channels.notify(GRID_CHANNELS.rows);
      this.updateWindow();
    });
  }

  setScroll(top: number, left: number): void {
    if (top === this.scrollTop && left === this.scrollLeft) return;
    this.scrollTop = top;
    this.scrollLeft = left;
    this.channels.batch(() => {
      this.channels.notify(GRID_CHANNELS.scroll);
      this.updateWindow();
    });
  }

  get viewport(): { width: number; height: number } {
    return { width: this.viewportWidth, height: this.viewportHeight };
  }

  get rowCount(): number {
    return this.rowModel.rowCount;
  }

  get headerLevels(): { top: number; height: number }[] {
    const custom = this.options.headerHeight;
    let top = this.lettersHeight;
    return this.columns.headerRows.map((_, level) => {
      const height = Math.max(
        1,
        Math.round((typeof custom === "number" ? custom : custom?.[level]) ?? this.headerHeight),
      );
      const box = { top, height };
      top += height;
      return box;
    });
  }

  get lettersHeight(): number {
    return this.options.columnLetters ? this.headerHeight : 0;
  }

  get headerTotalHeight(): number {
    const last = this.headerLevels.at(-1);
    return last ? last.top + last.height : this.lettersHeight;
  }

  headerBox(cell: HeaderCell<TRow, TNode>): HitBox {
    const levels = this.headerLevels;
    const first = levels[cell.level];
    const last = levels[cell.level + cell.rowSpan - 1];
    const { left, right } = this.columnSpanX(cell.first, cell.last);
    return {
      left,
      top: first.top,
      width: right - left,
      height: last.top + last.height - first.top,
    };
  }

  get bodyTop(): number {
    return this.headerTotalHeight + this.pinnedTopHeight;
  }

  get scrollInset(): Insets {
    const { left, right } = this.columns.widths;
    return { top: this.bodyTop, bottom: this.pinnedBottomHeight, left, right };
  }

  get gutter(): number {
    return this.gutterWidth;
  }

  get bodyScrollHeight(): number {
    return this.mapping.scrollSize;
  }

  get bandTop(): number {
    return this.bandOffset;
  }

  get rowWindowRange(): { start: number; end: number } {
    return { start: this.rowWindow.start, end: this.rowWindow.end };
  }

  viewportBox(rect: IndexRect): HitBox {
    const { left, right } = this.columnSpanX(rect.left, rect.right);
    const top = this.bodyTop - this.contentTop + this.offsets.offsetOf(rect.top);
    return {
      left,
      top,
      width: right - left,
      height: this.rowsHeight(rect.top, rect.bottom - rect.top + 1),
    };
  }

  renderedRows(): number[] {
    const rows = withExtra(this.rowWindow.start, this.rowWindow.end, this.activePosition()?.row);
    const anchors = this.spans
      .anchorsAbove(this.rowWindow.start)
      .filter((row) => !rows.includes(row));
    return anchors.length > 0 ? [...anchors, ...rows] : rows;
  }

  get spans(): SpanIndex<TRow, TNode> {
    this.spanIndex ??= new SpanIndex(this.rowModel, this.columns, (row, column) =>
      this.cellContext(this.rowModel.nodeAt(row), row, column),
    );
    return this.spanIndex;
  }

  get stickyRows(): readonly StickyRow[] {
    return this.sticky;
  }

  get visibleRange(): VisibleRange | null {
    return this.range;
  }

  get pinnedTopHeight(): number {
    return this.pinnedTop.nodes.reduce((sum, node) => sum + this.heightFor(node), 0);
  }

  get pinnedBottomHeight(): number {
    return this.pinnedBottom.nodes.reduce((sum, node) => sum + this.heightFor(node), 0);
  }

  pinnedLayout(side: "top" | "bottom"): PinnedRow<TRow>[] {
    let top = 0;
    return (side === "top" ? this.pinnedTop : this.pinnedBottom).nodes.map((node) => {
      const row = { node, top, height: this.heightFor(node) };
      top += row.height;
      return row;
    });
  }

  heightFor(node: RowNode<TRow>): number {
    const sizing = this.state.rowSizing.value;
    const key = String(node.id);
    const height =
      this.transientHeights.get(node.id) ??
      (Object.hasOwn(sizing, key) ? sizing[key] : undefined) ??
      this.options.getRowHeight?.(node.data) ??
      this.defaultRowHeight;
    return Math.max(1, Math.round(height));
  }

  setRowExpanded(rowId: RowId, expanded: boolean): void {
    const current = this.state.expandedRowIds.value;
    if (current.includes(rowId) === expanded) return;
    this.commit({
      expandedRowIds: expanded ? [...current, rowId] : current.filter((id) => id !== rowId),
    });
  }

  previewRowHeight(rowId: RowId, height: number | undefined): void {
    if (height === undefined) this.transientHeights.delete(rowId);
    else this.transientHeights.set(rowId, Math.max(MIN_ROW_HEIGHT, Math.round(height)));
    this.channels.batch(() => {
      this.refreshRows(this.rowModel.indexOf(rowId));
      this.updateWindow();
    });
  }

  setRowHeight(rowId: RowId, height: number): void {
    this.channels.batch(() => {
      this.previewRowHeight(rowId, undefined);
      this.commit({
        rowSizing: {
          ...this.state.rowSizing.value,
          [String(rowId)]: Math.max(MIN_ROW_HEIGHT, Math.round(height)),
        },
      });
    });
  }

  resetRowHeight(rowId: RowId): void {
    const key = String(rowId);
    this.commit({
      rowSizing: Object.fromEntries(
        Object.entries(this.state.rowSizing.value).filter(([id]) => id !== key),
      ),
    });
  }

  private refreshRows(forceFrom = -1) {
    const { options } = this;
    const expanded = this.state.expandedRowIds.value;
    const inputs = [
      options.rows,
      options.getParentId,
      options.isFullWidthRow,
      options.getRowHeight,
      expanded,
      this.state.rowSizing.value,
    ];
    const unchanged = inputs.every((input, index) => Object.is(input, this.rowInputs[index]));
    if (unchanged && forceFrom < 0) return;
    const heightsChanged =
      !Object.is(inputs[3], this.rowInputs[3]) || !Object.is(inputs[5], this.rowInputs[5]);
    this.rowInputs = inputs;
    if (
      this.expandedSet.size !== expanded.length ||
      !expanded.every((id) => this.expandedSet.has(id))
    ) {
      this.expandedSet = new Set(expanded);
    }

    const anchor = this.captureAnchor();
    const rowsBefore = this.rowCount;
    this.source.setRows(options.rows, options.getRowId);
    const { firstChanged, moved } = this.clientModel.rebuild({
      getParentId: options.getParentId,
      isFullWidthRow: options.isFullWidthRow,
      expanded: this.expandedSet,
    });
    const candidates = [firstChanged, forceFrom, heightsChanged ? 0 : -1].filter(
      (index) => index >= 0,
    );
    if (moved && rowsBefore > 0) this.selection.collapseRanges();
    this.editing.dropIfGone();
    if (candidates.length === 0) return;
    this.resetHeights(Math.min(...candidates));
    this.spanIndex = null;
    this.rowWindow.invalidate();
    this.restoreAnchor(anchor);
    this.channels.notify(GRID_CHANNELS.rows);
  }

  renderedColumns(): number[] {
    const { centerStart, centerEnd, leaves } = this.columns;
    const active = this.activePosition()?.column;
    const extra =
      active !== undefined && active >= centerStart && active < centerEnd
        ? active - centerStart
        : undefined;
    const indices: number[] = [];
    for (let index = 0; index < centerStart; index++) indices.push(index);
    for (const index of withExtra(this.columnWindow.start, this.columnWindow.end, extra)) {
      indices.push(centerStart + index);
    }
    for (let index = centerEnd; index < leaves.length; index++) indices.push(index);
    return indices;
  }

  rowTop(index: number): number {
    return this.offsets.offsetOf(index) - this.origin;
  }

  rowHeight(index: number): number {
    return this.offsets.heightOf(index);
  }

  rowsHeight(start: number, count: number): number {
    return this.offsets.offsetOf(start + count) - this.offsets.offsetOf(start);
  }

  nodeAt(index: number): RowNode<TRow> {
    return this.rowModel.nodeAt(index);
  }

  resolveCell(rowIndex: number, columnIndex: number): ResolvedCell<TRow, TNode> {
    return this.resolveNodeCell(this.rowModel.nodeAt(rowIndex), rowIndex, columnIndex);
  }

  resolveNodeCell(
    node: RowNode<TRow>,
    rowIndex: number,
    columnIndex: number,
  ): ResolvedCell<TRow, TNode> {
    const base = this.cellContext(node, rowIndex, columnIndex);
    const column = this.columns.leaves[columnIndex];
    const { defaultCell, getCell } = this.options;
    const spec = mergeCellSpecs(defaultCell, column.def.cell, getCell?.(base));
    const target: GridTarget = { kind: "cell", rowId: node.id, columnId: column.id };
    return {
      spec,
      ctx: {
        ...base,
        formattedValue: formatCellValue(spec, base),
        openMenu: (event: MenuAnchorEvent) => {
          this.openMenu(target, event.currentTarget, null, event.detail === 0);
        },
        dragHandleProps:
          rowIndex >= 0 ? this.dnd.handleProps({ kind: "rows", id: node.id }) : undefined,
      },
    };
  }

  cellText(node: RowNode<TRow>, rowIndex: number, columnIndex: number): string {
    return this.resolveNodeCell(node, rowIndex, columnIndex).ctx.formattedValue;
  }

  get isTree(): boolean {
    return this.options.getParentId !== undefined;
  }

  sourceNodes(): readonly RowNode<TRow>[] {
    return this.source.nodes;
  }

  sourceNode(id: RowId): RowNode<TRow> | undefined {
    return this.source.getNode(id) ?? this.pinnedTop.getNode(id) ?? this.pinnedBottom.getNode(id);
  }

  isFullWidthNode(node: RowNode<TRow>): boolean {
    return (
      this.source.getNode(node.id) === node && this.options.isFullWidthRow?.(node.data) === true
    );
  }

  get menuRequest(): MenuRequest<TNode> | null {
    return this.menu;
  }

  openMenu(
    target: GridTarget,
    anchor: unknown,
    point: { x: number; y: number } | null = null,
    fromKeyboard = false,
  ): boolean {
    const entries = this.menuEntries(target);
    if (!entries || entries.length === 0) return false;
    this.menu = { target, anchor, point, entries, fromKeyboard };
    this.channels.notify(GRID_CHANNELS.menu);
    return true;
  }

  openCellMenuAt(
    position: CellPosition,
    anchor: unknown,
    point: { x: number; y: number },
  ): boolean {
    const address = this.addressOf(position);
    if (!address) return false;
    const inRange = this.selection.rangeRects().some((rect) => rectContains(rect, position));
    this.channels.batch(() => {
      if (!inRange) this.selection.collapseRanges();
      this.setActiveCell(position, { reveal: false });
    });
    return this.openMenu({ kind: "cell", ...address }, anchor, point);
  }

  closeMenu(): void {
    if (!this.menu) return;
    this.menu = null;
    this.channels.notify(GRID_CHANNELS.menu);
  }

  headerContext(columnId: string): HeaderContext<TRow, TNode> | null {
    const cell = this.columns.headerCell(columnId);
    if (!cell) return null;
    const cached = this.headerContexts.get(columnId);
    if (
      cached?.def === cell.def &&
      cached.level === cell.level &&
      cached.isGroup === cell.isGroup
    ) {
      return cached;
    }
    const ctx: HeaderContext<TRow, TNode> = {
      columnId,
      def: cell.def,
      level: cell.level,
      isGroup: cell.isGroup,
      openMenu: (event: MenuAnchorEvent) => {
        this.openMenu({ kind: "header", columnId }, event.currentTarget, null, event.detail === 0);
      },
      dragHandleProps: this.dnd.handleProps({ kind: "columns", id: columnId }),
    };
    this.headerContexts.set(columnId, ctx);
    return ctx;
  }

  private menuEntries(target: GridTarget): readonly MenuEntry<TNode>[] | undefined {
    if (target.kind === "header") {
      const ctx = this.headerContext(target.columnId);
      if (!ctx) return undefined;
      const ids = this.selection.headerMenuIds(target.columnId, ctx.isGroup);
      return ctx.def.menu?.({ ...ctx, ids });
    }
    const position = this.positionOf(target);
    if (!position) return undefined;
    const { spec, ctx } = this.resolveCell(position.row, position.column);
    return spec.menu?.({ ...ctx, ...this.selection.cellMenuTargets(ctx) });
  }

  hitTest(x: number, y: number): CoreHit | null {
    const width = this.viewportWidth;
    const height = this.viewportHeight;
    if (x < 0 || y < 0 || x >= width || y >= height) return null;
    const index = this.columnIndexAtX(x);
    const leaf = this.columns.leaves[index];
    const span = leaf ? this.columnSpanX(index, index) : { left: 0, right: this.gutterWidth };
    const columnId = leaf?.id ?? null;
    const hit = (
      region: HitRegion,
      rowIndex: number,
      rowId: RowId | null,
      top: number,
      boxHeight: number,
      headerId: string | null = null,
      box = span,
    ): CoreHit => ({
      region,
      rowId,
      rowIndex,
      columnId,
      headerId,
      fractionX: (x - box.left) / Math.max(1, box.right - box.left),
      fractionY: (y - top) / Math.max(1, boxHeight),
      box: { left: box.left, top, width: box.right - box.left, height: boxHeight },
    });

    const header = this.headerTotalHeight;
    if (y < header) {
      const letters = this.lettersHeight;
      if (y < letters) return hit("header", -1, null, 0, letters, columnId);
      const cell = leaf && this.headerCellAt(index, y);
      if (!cell) return hit("header", -1, null, letters, header - letters);
      const box = this.headerBox(cell);
      return hit("header", -1, null, box.top, box.height, cell.id, {
        left: box.left,
        right: box.left + box.width,
      });
    }

    const { bodyTop, bodyBottom } = this.rowGeometry();
    if (y < bodyTop) {
      for (const row of this.pinnedLayout("top")) {
        const top = header + row.top;
        if (y < top + row.height) return hit("top", -1, row.node.id, top, row.height);
      }
    }

    if (this.pinnedBottom.nodes.length > 0 && y >= bodyBottom) {
      for (const row of this.pinnedLayout("bottom")) {
        const top = bodyBottom + row.top;
        if (y < top + row.height) return hit("bottom", -1, row.node.id, top, row.height);
      }
      return null;
    }

    for (const stuck of this.sticky) {
      const top = bodyTop + stuck.top;
      const rowHeight = this.offsets.heightOf(stuck.index);
      if (y >= top && y < top + rowHeight) {
        return hit("body", stuck.index, this.rowModel.nodeAt(stuck.index).id, top, rowHeight);
      }
    }
    const content = y - bodyTop + this.contentTop;
    if (content >= this.offsets.total) return hit("body", -1, null, y, 0);
    const row = this.offsets.indexAt(content);
    const top = bodyTop + this.offsets.offsetOf(row) - this.contentTop;
    return hit("body", row, this.rowModel.nodeAt(row).id, top, this.offsets.heightOf(row));
  }

  bodyCellNear(x: number, y: number): CellPosition | null {
    const { bodyTop, bodyBottom } = this.rowGeometry();
    const right = this.visibleCanvasWidth() - 1;
    if (bodyBottom <= bodyTop || right < this.gutterWidth) return null;
    const hit = this.hitTest(clamp(x, this.gutterWidth, right), clamp(y, bodyTop, bodyBottom - 1));
    if (!hit || hit.rowIndex < 0 || hit.columnId === null) return null;
    const column = this.columns.indexOf(hit.columnId);
    return column >= 0 ? { row: hit.rowIndex, column } : null;
  }

  rowGeometry(): RowGeometry {
    const { bodyTop } = this;
    return {
      bodyTop,
      bodyBottom: Math.min(
        this.viewportHeight - this.pinnedBottomHeight,
        bodyTop + this.offsets.total - this.contentTop,
      ),
      contentTop: this.contentTop,
      offsets: this.offsets,
    };
  }

  columnIndexAtX(x: number): number {
    const { leaves, widths } = this.columns;
    if (x < this.gutterWidth) return -1;
    const visible = this.visibleCanvasWidth();
    const region = x < widths.left ? "left" : x >= visible - widths.right ? "right" : "center";
    const local = x - this.regionOrigin(region);
    let after = -1;
    for (const leaf of leaves) {
      if (leaf.region !== region) continue;
      if (local < leaf.x + leaf.width) return leaf.index;
      after = leaf.index;
    }
    return after < 0 ? (region === "left" ? -1 : leaves.length) : after + 1;
  }

  columnSpanX(first: number, last: number): { left: number; right: number } {
    const { leaves } = this.columns;
    const start = leaves[first];
    const end = leaves[last];
    return {
      left: this.regionOrigin(start.region) + start.x,
      right: this.regionOrigin(end.region) + end.x + end.width,
    };
  }

  private regionOrigin(region: Region): number {
    const { widths } = this.columns;
    if (region === "left") return 0;
    if (region === "right") return this.visibleCanvasWidth() - widths.right;
    return widths.left - this.scrollLeft;
  }

  private visibleCanvasWidth() {
    const { canvasWidth } = this.columns;
    return Math.min(this.viewportWidth || canvasWidth, canvasWidth);
  }

  private headerCellAt(column: number, y: number) {
    const levels = this.headerLevels;
    const below = levels.findIndex(({ top, height }) => y < top + height);
    const level = below < 0 ? levels.length - 1 : below;
    for (let candidate = level; candidate >= 0; candidate--) {
      const cell = this.columns.headerRows[candidate]?.find(
        (header) => column >= header.first && column <= header.last,
      );
      if (cell && cell.level + cell.rowSpan > level) return cell;
    }
    return undefined;
  }

  get flashes(): readonly Flash[] {
    return this.flashList;
  }

  flash({ rows = [], columns = [], cells = [], kind = "brand" }: FlashTargets): void {
    if (rows.length + columns.length + cells.length === 0) return;
    this.flashList = [...this.flashList, { id: ++this.flashId, rows, columns, cells, kind }];
    this.channels.notify(GRID_CHANNELS.flash);
  }

  dismissFlash(id: number): void {
    const next = this.flashList.filter((flash) => flash.id !== id);
    if (next.length === this.flashList.length) return;
    this.flashList = next;
    this.channels.notify(GRID_CHANNELS.flash);
  }

  pageRows(): number {
    const contentTop = this.contentTop;
    return Math.max(
      1,
      this.offsets.indexAt(contentTop + this.bodyViewportHeight()) -
        this.offsets.indexAt(contentTop),
    );
  }

  private registerCommands() {
    const { selection, dnd, editing } = this;
    const handlers: Record<BuiltInCommand, CommandHandler> = {
      ...handlersFor(NAVIGATION_COMMANDS, (command) => this.move(command)),
      ...handlersFor(EXTEND_COMMANDS, (command) => selection.extend(command)),
      toggleRow: () => {
        const active = this.activePosition();
        if (!active || !this.rowModel.hasChildren(active.row)) return false;
        const node = this.rowModel.nodeAt(active.row);
        this.setRowExpanded(node.id, !this.rowModel.isExpanded(active.row));
        return true;
      },
      selectAll: () => selection.selectAllCells(),
      selectRow: () => selection.selectCovered("rows"),
      selectColumn: () => selection.selectCovered("columns"),
      clearSelection: () => selection.clear(),
      toggleRowSelected: () => selection.toggleActiveRow(),
      openMenu: () => {
        const active = this.activeAddress();
        return active !== null && this.openMenu({ kind: "cell", ...active }, null, null, true);
      },
      openColumnMenu: () => {
        const active = this.activeAddress();
        return (
          active !== null &&
          this.openMenu({ kind: "header", columnId: active.columnId }, null, null, true)
        );
      },
      moveRowsUp: () => dnd.move("rows", -1),
      moveRowsDown: () => dnd.move("rows", 1),
      moveColumnsLeft: () => dnd.move("columns", -1),
      moveColumnsRight: () => dnd.move("columns", 1),
      editCell: () => {
        const active = this.activePosition();
        return active !== null && editing.startCell(active);
      },
    };
    for (const [name, handler] of Object.entries(handlers)) this.commands.register(name, handler);
  }

  rowContext(node: RowNode<TRow>, rowIndex: number): RowContext<TRow> {
    const shown = rowIndex >= 0;
    return {
      row: node.data,
      rowId: node.id,
      rowIndex,
      depth: shown ? this.rowModel.depthOf(rowIndex) : 0,
      hasChildren: shown && this.rowModel.hasChildren(rowIndex),
      expanded: shown && this.rowModel.isExpanded(rowIndex),
    };
  }

  private cellContext(
    node: RowNode<TRow>,
    rowIndex: number,
    columnIndex: number,
  ): CellContext<TRow> {
    const column = this.columns.leaves[columnIndex];
    if (!column) throw new RangeError(`DataGrid: no column at index ${columnIndex}`);
    return {
      ...this.rowContext(node, rowIndex),
      columnId: column.id,
      columnIndex,
      value: column.getValue(node.data),
    };
  }

  positionOf({ rowId, columnId }: CellAddress): CellPosition | null {
    const row = this.rowModel.indexOf(rowId);
    const column = this.columns.indexOf(columnId);
    return row >= 0 && column >= 0 ? { row, column } : null;
  }

  addressOf({ row, column }: CellPosition): CellAddress | null {
    const leaf = this.columns.leaves[column];
    if (!leaf || row < 0 || row >= this.rowCount) return null;
    return { rowId: this.rowModel.nodeAt(row).id, columnId: leaf.id };
  }

  activeAddress(): CellAddress | null {
    const active = this.activePosition();
    return active && this.addressOf(active);
  }

  activePosition(): CellPosition | null {
    if (this.rowCount === 0 || this.columns.leaves.length === 0) return null;
    const { active } = this;
    const row = active ? this.shownRowOf(active.rowId) : -1;
    const column = active ? this.columns.indexOf(active.columnId) : -1;
    const position = {
      row: row >= 0 ? row : Math.min(this.lastActive.row, this.rowCount - 1),
      column:
        column >= 0 ? column : Math.min(this.lastActive.column, this.columns.leaves.length - 1),
    };
    if (!this.spans.active) return position;
    const span = this.spans.spanAt(position.row, position.column);
    return { row: span.row, column: span.column };
  }

  private shownRowOf(id: RowId): number {
    // getParentId can link rows into a cycle
    const seen = new Set<RowId>();
    for (
      let current: RowId | undefined = id;
      current !== undefined && !seen.has(current);
      current = this.rowModel.parentIdOf(current)
    ) {
      const index = this.rowModel.indexOf(current);
      if (index >= 0) return index;
      seen.add(current);
    }
    return -1;
  }

  setActiveCell(position: CellPosition, { reveal = true }: { reveal?: boolean } = {}): void {
    const row = clampIndex(position.row, this.rowCount);
    const column = clampIndex(position.column, this.columns.leaves.length);
    const next = this.addressOf({ row, column });
    if (!next) return;
    this.lastActive = { row, column };
    this.channels.batch(() => {
      if (this.active?.rowId !== next.rowId || this.active.columnId !== next.columnId) {
        this.active = next;
        this.channels.notify(GRID_CHANNELS.active);
      }
      if (reveal) this.revealCell({ row, column });
      this.updateWindow();
    });
  }

  runCommand(name: string): boolean {
    return this.commands.run(name);
  }

  scrollToCell(position: CellPosition): void {
    this.channels.batch(() => this.revealCell(position));
  }

  takePendingScroll(): ScrollRequest | null {
    const request = this.pendingScroll;
    this.pendingScroll = null;
    return request;
  }

  copyPayload(): { text: string; html: string } | null {
    const cells = this.selection.copyCells();
    return cells && { text: encodeTsv(cells), html: encodeHtml(cells) };
  }

  getState(): DataGridState {
    return toSnapshot(this.stateValues());
  }

  restoreState(state: DataGridState): void {
    this.commit(migrateState(state));
  }

  private stateValues(): StateSlices {
    const { columnSizing, columnPinning, columnVisibility, expandedRowIds, rowSizing } = this.state;
    return {
      columnSizing: columnSizing.value,
      columnPinning: columnPinning.value,
      columnVisibility: columnVisibility.value,
      expandedRowIds: expandedRowIds.value,
      rowSizing: rowSizing.value,
    };
  }

  private control<K extends StateKey>(key: K, options: Partial<StateSlices>) {
    this.state[key].controlled = options[key];
  }

  private commit(partial: Partial<StateSlices>): void {
    const next = this.stateValues();
    const changed: StateKey[] = [];
    for (const key of STATE_KEYS) {
      if (this.writeSlice(key, partial[key], next)) changed.push(key);
    }
    if (changed.length === 0) return;
    for (const key of changed) this.emitSlice(key, next[key]);
    this.options.onStateChange?.(toSnapshot(next));
    this.channels.batch(() => {
      this.refreshRows();
      this.refreshColumns();
      this.updateWindow();
    });
  }

  private writeSlice<K extends StateKey>(
    key: K,
    value: StateSlices[K] | undefined,
    next: StateSlices,
  ): boolean {
    if (value === undefined || sameSlice(value, next[key])) return false;
    next[key] = value;
    this.state[key].set(value);
    return true;
  }

  private emitSlice<K extends StateKey>(key: K, value: StateSlices[K]) {
    STATE_CALLBACKS[key](this.options)?.(value);
  }

  previewColumnWidths(widths: ColumnSizing | null): void {
    if (widths === this.transientWidths) return;
    this.transientWidths = widths;
    this.channels.batch(() => {
      this.refreshColumns();
      this.updateWindow();
    });
  }

  setColumnWidths(widths: ColumnSizing): void {
    const clamped = Object.entries(widths).map(([id, width]) => [
      id,
      this.columns.clampWidth(id, width),
    ]);
    this.channels.batch(() => {
      this.previewColumnWidths(null);
      this.commit({
        columnSizing: { ...this.state.columnSizing.value, ...Object.fromEntries(clamped) },
      });
    });
  }

  resetColumnWidth(columnId: string): void {
    const ids = new Set(this.columns.leafIdsUnder(columnId));
    this.commit({
      columnSizing: Object.fromEntries(
        Object.entries(this.state.columnSizing.value).filter(([id]) => !ids.has(id)),
      ),
    });
  }

  setColumnHidden(columnId: string, hidden: boolean): void {
    const ids = this.columns.leafIdsUnder(columnId);
    this.commit({
      columnVisibility: {
        ...this.state.columnVisibility.value,
        ...Object.fromEntries(ids.map((id) => [id, !hidden])),
      },
    });
  }

  setColumnPinned(columnId: string, side: PinnedSide | false): void {
    const top = this.columns.topIdOf(columnId);
    if (top === undefined) return;
    this.commit({ columnPinning: { ...this.state.columnPinning.value, [top]: side } });
  }

  private columnState(): ColumnState {
    const sizing = this.state.columnSizing.value;
    return {
      columnSizing: this.transientWidths ? { ...sizing, ...this.transientWidths } : sizing,
      columnPinning: this.state.columnPinning.value,
      columnVisibility: this.state.columnVisibility.value,
    };
  }

  private refreshColumns() {
    const defs = this.options.columnDefs;
    const inputs = [
      defs,
      this.state.columnSizing.value,
      this.transientWidths,
      this.state.columnPinning.value,
      this.state.columnVisibility.value,
      this.viewportWidth,
      this.gutterWidth,
    ];
    if (inputs.every((input, index) => Object.is(input, this.columnInputs[index]))) return;
    this.columnInputs = inputs;
    const previous = this.columns;
    if (previous.defs !== defs) this.headerContexts.clear();
    this.columns = new ColumnModel(defs, this.columnState(), this.viewportWidth, this.gutterWidth);
    this.columnWindow.invalidate();
    this.channels.notify(GRID_CHANNELS.geometry);
    const sameLeaves =
      previous.defs === defs &&
      previous.leaves.length === this.columns.leaves.length &&
      previous.leaves.every(
        (leaf, index) =>
          leaf.id === this.columns.leaves[index].id &&
          leaf.region === this.columns.leaves[index].region,
      );
    if (!sameLeaves) {
      this.spanIndex = null;
      this.channels.notify(GRID_CHANNELS.cells);
      if (previous.leaves.length > 0) this.selection.collapseRanges();
    }
    this.editing.dropIfGone();
  }

  private move(command: NavigationCommand): boolean {
    const from = this.activePosition();
    if (!from) return false;
    const pageRows = this.pageRows();
    const span = this.spans.active ? this.spans.spanAt(from.row, from.column) : undefined;
    const origin = { ...from };
    if (span && (command === "moveDown" || command === "movePageDown")) {
      origin.row = span.row + span.rows - 1;
    }
    if (span && (command === "moveRight" || command === "moveNext")) {
      origin.column = span.column + span.columns - 1;
    }
    const target = navigate(command, origin, {
      rowCount: this.rowCount,
      columnCount: this.columns.leaves.length,
      pageRows,
    });
    if (!target) return false;
    this.channels.batch(() => {
      this.selection.collapseRanges();
      this.setActiveCell(target);
    });
    return true;
  }

  private revealCell({ row, column }: CellPosition): void {
    const request: ScrollRequest = {};
    if (row >= 0 && row < this.rowCount) {
      const top = this.offsets.offsetOf(row);
      const bottom = top + this.offsets.heightOf(row);
      const viewport = this.bodyViewportHeight();
      let stuck = 0;
      for (
        let parent = this.rowModel.parentOf(row);
        parent >= 0;
        parent = this.rowModel.parentOf(parent)
      ) {
        stuck += this.offsets.heightOf(parent);
      }
      let content = this.contentTop;
      if (top - stuck < content) content = Math.max(0, top - stuck);
      else if (bottom > content + viewport) content = Math.max(top - stuck, bottom - viewport);
      if (content !== this.contentTop) request.top = Math.round(this.mapping.toScroll(content));
    }
    const target = this.columns.leaves[column];
    if (target?.region === "center") {
      const visible = this.centerViewportWidth();
      const right = target.x + target.width;
      let scroll = this.scrollLeft;
      if (target.x < scroll) scroll = target.x;
      else if (right > scroll + visible) scroll = Math.max(target.x, right - visible);
      if (scroll !== this.scrollLeft) request.left = scroll;
    }
    if (request.top === undefined && request.left === undefined) return;
    this.requestScroll(request);
  }

  private requestScroll(request: ScrollRequest) {
    this.pendingScroll = { ...this.pendingScroll, ...request };
    this.scrollTop = request.top ?? this.scrollTop;
    this.scrollLeft = request.left ?? this.scrollLeft;
    this.channels.notify(GRID_CHANNELS.scroll);
    this.updateWindow();
  }

  private bodyViewportHeight() {
    return Math.max(0, this.viewportHeight - this.bodyTop - this.pinnedBottomHeight);
  }

  private centerViewportWidth() {
    const { left, right } = this.columns.widths;
    return Math.max(0, this.viewportWidth - left - right);
  }

  private resetHeights(from: number) {
    this.offsets.reset(this.rowCount, (index) => this.heightFor(this.rowModel.nodeAt(index)), from);
  }

  private captureAnchor(): Anchor | null {
    if (this.contentTop <= 0 || this.offsets.count === 0 || this.rowCount === 0) return null;
    const index = this.offsets.indexAt(this.contentTop);
    if (index < 0 || index >= this.rowCount) return null;
    const ids: RowId[] = [];
    for (let row = index; row >= 0; row = this.rowModel.parentOf(row)) {
      ids.push(this.rowModel.nodeAt(row).id);
    }
    return { ids, delta: this.contentTop - this.offsets.offsetOf(index) };
  }

  private restoreAnchor(anchor: Anchor | null) {
    if (!anchor) return;
    const shown = anchor.ids.findIndex((id) => this.rowModel.indexOf(id) >= 0);
    if (shown < 0) return;
    const index = this.rowModel.indexOf(anchor.ids[shown]);
    const delta = shown === 0 ? Math.min(anchor.delta, this.offsets.heightOf(index) - 1) : 0;
    const content = this.offsets.offsetOf(index) + delta;
    const mapping = createScrollMapping(this.offsets.total, this.bodyViewportHeight());
    const top = Math.round(mapping.toScroll(content));
    if (top !== this.scrollTop) this.requestScroll({ top });
  }

  private updateWindow() {
    const viewport = this.bodyViewportHeight();
    const mapping = createScrollMapping(this.offsets.total, viewport);
    if (
      mapping.scrollSize !== this.mapping.scrollSize ||
      mapping.stretched !== this.mapping.stretched
    ) {
      this.channels.notify(GRID_CHANNELS.geometry);
    }
    this.mapping = mapping;
    const maxScroll = Math.max(0, mapping.scrollSize - viewport);
    this.contentTop = mapping.toContent(Math.min(this.scrollTop, maxScroll));

    const rowsChanged = this.rowWindow.update(
      this.contentTop,
      this.contentTop + viewport,
      Math.max(MIN_OVERSCAN, viewport * ROW_OVERSCAN),
      this.offsets,
    );
    const columnsChanged = this.columnWindow.update(
      this.scrollLeft,
      this.scrollLeft + this.centerViewportWidth(),
      Math.max(MIN_OVERSCAN, this.centerViewportWidth() * COLUMN_OVERSCAN),
      this.columns,
    );
    if (rowsChanged || columnsChanged) this.channels.notify(GRID_CHANNELS.window);

    // A coarse origin keeps kept rows' tops fixed and stretched offsets within browser layout limits.
    this.origin = mapping.stretched
      ? Math.floor(this.offsets.offsetOf(this.rowWindow.start) / ORIGIN_STEP) * ORIGIN_STEP
      : 0;
    const bandOffset = this.origin + Math.min(this.scrollTop, maxScroll) - this.contentTop;
    if (bandOffset !== this.bandOffset) {
      this.bandOffset = bandOffset;
      if (!rowsChanged) this.channels.notify(GRID_CHANNELS.origin);
    }

    const sticky =
      this.rowCount > 0 ? stickyParents(this.contentTop, this.rowModel, this.offsets) : [];
    if (
      sticky.length !== this.sticky.length ||
      sticky.some(
        (row, index) =>
          row.index !== this.sticky[index].index || row.top !== this.sticky[index].top,
      )
    ) {
      this.sticky = sticky;
      this.channels.notify(GRID_CHANNELS.sticky);
    }
    this.updateRange(viewport);
  }

  private updateRange(viewport: number) {
    if (this.rowCount === 0) {
      if (this.range) this.channels.notify(GRID_CHANNELS.range);
      this.range = null;
      return;
    }
    const firstIndex = this.sticky[0]?.index ?? Math.max(0, this.offsets.indexAt(this.contentTop));
    const lastIndex = Math.max(
      firstIndex,
      this.offsets.indexAt(this.contentTop + Math.max(1, viewport) - 1),
    );
    const firstRowId = this.rowModel.nodeAt(firstIndex).id;
    const lastRowId = this.rowModel.nodeAt(lastIndex).id;
    const range = this.range;
    if (
      range?.firstIndex === firstIndex &&
      range.lastIndex === lastIndex &&
      range.firstRowId === firstRowId &&
      range.lastRowId === lastRowId
    ) {
      return;
    }
    this.range = { firstIndex, lastIndex, firstRowId, lastRowId };
    this.channels.notify(GRID_CHANNELS.range);
  }
}

const handlersFor = <C extends string>(names: readonly C[], run: (name: C) => boolean) =>
  Object.fromEntries(names.map((name) => [name, () => run(name)])) as Record<C, CommandHandler>;

const clampIndex = (index: number, count: number) =>
  count === 0 ? -1 : Math.max(0, Math.min(index, count - 1));

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

function withExtra(start: number, end: number, extra: number | undefined): number[] {
  const indices: number[] = [];
  if (extra !== undefined && extra < start) indices.push(extra);
  for (let index = start; index < end; index++) indices.push(index);
  if (extra !== undefined && extra >= end) indices.push(extra);
  return indices;
}
