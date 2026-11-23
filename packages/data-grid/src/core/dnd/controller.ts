import type { ColumnModel } from "../columns/columnModel";
import type { ColumnDef } from "../columns/types";
import type { CoreHit, RowGeometry } from "../layout/hit";
import type { StickyRow } from "../layout/sticky";
import type { RowModel } from "../rows/rowModel";
import type { RowId, RowNode } from "../rows/rowNode";
import type { CellPosition } from "../selection/navigation";
import type { EntitySelection } from "../selection/types";
import { type Channels, SHARED_CHANNELS } from "../store/channels";
import {
  type Placement,
  dropSlot,
  isContiguous,
  lastChild,
  listAxis,
  neighbour,
  rowAxis,
  settleGap,
} from "./reorder";
import type {
  ColumnsDrop,
  DragHandleProps,
  DragHandles,
  DragItem,
  DragSource,
  DropIndicator,
  DropPosition,
  RowsDrop,
} from "./types";

export const DND_CHANNELS = { drag: "drag", indicator: "indicator" } as const;

export interface DndOptions<TRow> {
  onRowsDrop?: (drop: RowsDrop) => void;
  onColumnsDrop?: (drop: ColumnsDrop) => void;
  /** Whether the middle third of a target takes the drag onto it, as a merge; otherwise it is a gap. No drop goes onto anything without it. */
  canDropOnto?: (source: DragSource, targetId: RowId) => boolean;
  /**
   * Whether this drag can drop into the gaps between rows or columns, as a move. Defaults to every drag. Where it
   * refuses, a whole target drops onto it when `canDropOnto` allows, else nothing does, and keyboard moves do nothing.
   */
  canDropBetween?: (source: DragSource) => boolean;
  /**
   * Whether a grip drag may land on the other axis at `hit`: a column over a row header (the gutter or a
   * `rowHeader` column's cell), or a row over the header. Without it a drag stays on its own axis.
   */
  canDropAcross?: (source: DragSource, hit: CoreHit) => boolean;
  /** Called on release over the other axis where `canDropAcross` allowed it, in place of a reorder drop. */
  onDropAcross?: (source: DragSource, hit: CoreHit) => void;
  /** Whether a row can be dragged or moved, and be a drop's target. Defaults to every row. */
  isRowReorderable?: (row: TRow) => boolean;
  /** A drop marker to draw while no grip drag is running, such as during an external drag or a merge picker. */
  indicator?: DropIndicator | null;
  dragHandles?: DragHandles;
  onKeyboardMove?: (source: DragSource) => void;
}

export const DND_OPTION_KEYS = {
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
} as const satisfies Record<keyof DndOptions<unknown>, true>;

export interface DndHost<TRow, TNode> {
  readonly channels: Channels;
  readonly rowModel: RowModel<TRow>;
  readonly columns: ColumnModel<TRow, TNode>;
  readonly selection: { readonly selection: EntitySelection | null };
  readonly stickyRows: readonly StickyRow[];
  activePosition(): CellPosition | null;
  rowGeometry(): RowGeometry;
  bodyContentY(y: number): number;
  columnIndexAtX(x: number): number;
  columnSpanX(first: number, last: number): { left: number; right: number };
  hitTest(x: number, y: number): CoreHit | null;
}

export interface DragAcross {
  hit: CoreHit;
  allowed: boolean;
}

interface ActiveDrag {
  source: DragSource;
  contiguous: boolean;
  target: Placement<RowId> | null;
  across: DragAcross | null;
}

export class GridDnd<TRow, TNode> {
  private drag: ActiveDrag | null = null;

  constructor(
    private readonly host: DndHost<TRow, TNode>,
    private readonly options: () => DndOptions<TRow>,
  ) {}

  sync(next: DndOptions<TRow>, previous: DndOptions<TRow>): { rows: boolean; columns: boolean } {
    if (next.indicator !== previous.indicator) this.host.channels.notify(DND_CHANNELS.indicator);
    const handles = next.dragHandles !== previous.dragHandles;
    const changed = {
      rows:
        handles ||
        (next.onRowsDrop === undefined) !== (previous.onRowsDrop === undefined) ||
        next.isRowReorderable !== previous.isRowReorderable,
      columns:
        handles || (next.onColumnsDrop === undefined) !== (previous.onColumnsDrop === undefined),
    };
    if (changed.rows) this.host.channels.notify(SHARED_CHANNELS.cells);
    return changed;
  }

  get source(): DragSource | null {
    return this.drag?.source ?? null;
  }

  get placement(): Placement<RowId> | null {
    return this.drag?.target ?? null;
  }

  get across(): DragAcross | null {
    return this.drag?.across ?? null;
  }

  get indicator(): DropIndicator | null {
    const drag = this.drag;
    if (!drag) return this.options().indicator ?? null;
    if (!drag.target) return null;
    const { targetId, position } = drag.target;
    return drag.source.kind === "rows"
      ? { kind: "rows", id: targetId, position }
      : { kind: "columns", id: String(targetId), position };
  }

  isRowDragged(index: number): boolean {
    const source = this.drag?.source;
    if (source?.kind !== "rows") return false;
    const model = this.host.rowModel;
    for (let row = index; row >= 0; row = model.parentOf(row)) {
      const { id } = model.nodeAt(row);
      if (source.ids.some((dragged) => dragged === id)) return true;
    }
    return false;
  }

  isDragged(kind: DragSource["kind"], id: RowId): boolean {
    const source = this.drag?.source;
    return source?.kind === kind && source.ids.some((dragged) => dragged === id);
  }

  handleProps(item: DragItem): DragHandleProps | undefined {
    const handles = this.options().dragHandles;
    if (!handles || !this.canDrag(item)) return undefined;
    return {
      className: handles.className,
      "aria-hidden": true,
      "data-drag-handle": "",
      onPointerDown: (event) => handles.press(item, event),
    };
  }

  canDrag(item: DragItem): boolean {
    if (item.kind === "rows") {
      const index = this.host.rowModel.indexOf(item.id);
      return index >= 0 && this.rowReorderable(this.host.rowModel.nodeAt(index));
    }
    const cell = this.host.columns.headerCell(item.id);
    return cell !== undefined && this.columnReorderable(cell.def);
  }

  begin(item: DragItem): boolean {
    const source = item.kind === "rows" ? this.rowSource(item.id) : this.columnSource(item.id);
    if (!source) return false;
    this.drag = { source, contiguous: this.contiguous(source), target: null, across: null };
    this.host.channels.batch(() => {
      this.host.channels.notify(DND_CHANNELS.drag);
      this.host.channels.notify(DND_CHANNELS.indicator);
    });
    return true;
  }

  /** Places the drag at `x, y`; `covered` means something above the grid takes the pointer there, so nothing is targeted. */
  hover(x: number, y: number, covered = false): void {
    const drag = this.drag;
    if (!drag) return;
    drag.across = covered ? null : this.acrossAt(drag.source, x, y);
    const target =
      covered || drag.across
        ? null
        : drag.source.kind === "rows"
          ? this.rowPlacement(drag, y)
          : this.columnPlacement(drag, x);
    if (target?.targetId === drag.target?.targetId && target?.position === drag.target?.position) {
      return;
    }
    drag.target = target;
    this.host.channels.notify(DND_CHANNELS.indicator);
  }

  end(cancelled: boolean): void {
    const drag = this.drag;
    if (!drag) return;
    this.drag = null;
    this.host.channels.batch(() => {
      this.host.channels.notify(DND_CHANNELS.drag);
      this.host.channels.notify(DND_CHANNELS.indicator);
    });
    if (cancelled) return;
    if (drag.target) this.emit(drag.source, drag.target);
    else if (drag.across?.allowed) this.options().onDropAcross?.(drag.source, drag.across.hit);
  }

  move(kind: DragSource["kind"], step: -1 | 1): boolean {
    const source = kind === "rows" ? this.activeRowSource() : this.activeColumnSource();
    if (!source || source.ids.length === 0) return false;
    const target = this.neighbourOf(source, step);
    if (target === undefined || !this.canDropBetween(source)) return false;
    this.emit(source, { targetId: target, position: step < 0 ? "before" : "after" });
    this.options().onKeyboardMove?.(source);
    return true;
  }

  private emit(source: DragSource, { targetId, position }: Placement<RowId>) {
    const options = this.options();
    if (source.kind === "rows") options.onRowsDrop?.({ ids: source.ids, targetId, position });
    else options.onColumnsDrop?.({ ids: source.ids, targetId: String(targetId), position });
  }

  private rowReorderable(node: RowNode<TRow>): boolean {
    const options = this.options();
    return options.onRowsDrop !== undefined && options.isRowReorderable?.(node.data) !== false;
  }

  private columnReorderable(def: ColumnDef<TRow, TNode>): boolean {
    return this.options().onColumnsDrop !== undefined && def.reorderable !== false;
  }

  private canDropOnto(source: DragSource, targetId: RowId): boolean {
    if (source.ids.some((id) => id === targetId)) return false;
    return this.options().canDropOnto?.(source, targetId) === true;
  }

  private canDropBetween(source: DragSource): boolean {
    return this.options().canDropBetween?.(source) !== false;
  }

  private acrossAt(source: DragSource, x: number, y: number): DragAcross | null {
    const { canDropAcross } = this.options();
    if (!canDropAcross) return null;
    const hit = this.host.hitTest(x, y);
    if (!hit) return null;
    const across = source.kind === "rows" ? hit.region === "header" : this.onRowHeader(hit);
    return across ? { hit, allowed: canDropAcross(source, hit) } : null;
  }

  private onRowHeader(hit: CoreHit): boolean {
    if (hit.region !== "body" || hit.rowId === null) return false;
    if (hit.columnId === null) return true;
    return this.host.columns.headerCell(hit.columnId)?.def.rowHeader === true;
  }

  private slot(source: DragSource, targetId: RowId, fraction: number): DropPosition | null {
    return dropSlot(fraction, this.canDropOnto(source, targetId), this.canDropBetween(source));
  }

  private allowed<Id extends RowId>(
    source: DragSource,
    placement: Placement<Id> | null,
  ): Placement<Id> | null {
    if (!placement) return null;
    return placement.position === "onto" || this.canDropBetween(source) ? placement : null;
  }

  private rowSource(id: RowId): DragSource | null {
    const model = this.host.rowModel;
    const index = model.indexOf(id);
    if (index < 0 || !this.rowReorderable(model.nodeAt(index))) return null;
    const selection = this.host.selection.selection;
    if (selection?.kind !== "rows" || !selection.ids.includes(id))
      return { kind: "rows", ids: [id] };
    const parent = model.parentOf(index);
    const ids = selection.ids
      .map((rowId) => model.indexOf(rowId))
      .filter(
        (row) =>
          row >= 0 && model.parentOf(row) === parent && this.rowReorderable(model.nodeAt(row)),
      )
      .sort((a, b) => a - b)
      .map((row) => model.nodeAt(row).id);
    return { kind: "rows", ids };
  }

  private columnSource(id: string): DragSource | null {
    const { columns } = this.host;
    const cell = columns.headerCell(id);
    if (!cell || !this.columnReorderable(cell.def)) return null;
    const selection = this.host.selection.selection;
    const kind = cell.isGroup ? "groups" : "columns";
    if (selection?.kind !== kind || !selection.ids.includes(id))
      return { kind: "columns", ids: [id] };
    const chosen = new Set<RowId>(selection.ids);
    const ids = columns
      .siblingsOf(id)
      .filter((sibling) => chosen.has(sibling.id) && this.columnReorderable(sibling.def))
      .map((sibling) => sibling.id);
    return { kind: "columns", ids };
  }

  private activeRowSource(): DragSource | null {
    const active = this.host.activePosition();
    return active ? this.rowSource(this.host.rowModel.nodeAt(active.row).id) : null;
  }

  private activeColumnSource(): DragSource | null {
    const active = this.host.activePosition();
    if (!active) return null;
    const { columns } = this.host;
    const leaf = columns.leaves[active.column];
    const selection = this.host.selection.selection;
    if (selection?.kind === "groups") {
      for (let id = columns.parentIdOf(leaf.id); id !== undefined; id = columns.parentIdOf(id)) {
        if (selection.ids.includes(id)) return this.columnSource(id);
      }
    }
    return this.columnSource(leaf.id);
  }

  private contiguous(source: DragSource): boolean {
    if (source.kind === "columns") {
      const siblings = this.host.columns.siblingsOf(source.ids[0]).map((cell) => cell.id);
      return isContiguous(listAxis(siblings), source.ids);
    }
    const model = this.host.rowModel;
    return isContiguous(
      rowAxis(model),
      source.ids.map((id) => model.indexOf(id)),
    );
  }

  private neighbourOf(source: DragSource, step: -1 | 1): RowId | undefined {
    const edge = step < 0 ? source.ids[0] : source.ids[source.ids.length - 1];
    if (source.kind === "rows") {
      const model = this.host.rowModel;
      const next = neighbour(rowAxis(model), model.indexOf(edge), step);
      const node = next === undefined ? undefined : model.nodeAt(next);
      return node && this.rowReorderable(node) ? node.id : undefined;
    }
    const { columns } = this.host;
    const siblings = columns.siblingsOf(source.ids[0]).map((cell) => cell.id);
    const next = neighbour(listAxis(siblings), String(edge), step);
    const cell = next === undefined ? undefined : columns.headerCell(next);
    return cell && this.columnReorderable(cell.def) ? cell.id : undefined;
  }

  private rowContentY(y: number): number {
    const { contentTop, offsets } = this.host.rowGeometry();
    const content = this.host.bodyContentY(y);
    const local = content - contentTop;
    for (const { index, top } of this.host.stickyRows) {
      if (local >= top && local < top + offsets.heightOf(index)) {
        return offsets.offsetOf(index) + local - top;
      }
    }
    return content;
  }

  private rowPlacement(drag: ActiveDrag, y: number): Placement<RowId> | null {
    const model = this.host.rowModel;
    const first = model.indexOf(drag.source.ids[0]);
    if (first < 0) return null;
    const parent = model.parentOf(first);
    const depth = model.depthOf(first);
    const start = parent + 1;
    const end = parent < 0 ? model.rowCount : model.subtreeEnd(parent);
    if (end <= start) return null;
    const { offsets } = this.host.rowGeometry();
    const content = this.rowContentY(y);
    const row = offsets.indexAt(content);

    let placement: Placement<number>;
    if (row < start) placement = { targetId: start, position: "before" };
    else if (row >= end) placement = { targetId: lastChild(model, parent), position: "after" };
    else {
      const target = model.ancestorAt(row, depth);
      const top = offsets.offsetOf(target);
      const height = offsets.heightOf(target);
      const offset = content - top;
      const block = offsets.offsetOf(model.subtreeEnd(target)) - top;
      const position =
        offset < height
          ? this.slot(drag.source, model.nodeAt(target).id, offset / height)
          : offset < block / 2
            ? "before"
            : "after";
      if (!position) return null;
      placement = { targetId: target, position };
    }
    if (!this.rowReorderable(model.nodeAt(placement.targetId))) return null;
    const dragged = new Set(drag.source.ids.map((id) => model.indexOf(id)));
    const settled = settleGap(rowAxis(model), dragged, drag.contiguous, placement);
    return this.allowed(
      drag.source,
      settled && { targetId: model.nodeAt(settled.targetId).id, position: settled.position },
    );
  }

  private columnOnto(source: DragSource, index: number): Placement<string> | null {
    const { columns } = this.host;
    const sourceCell = columns.headerCell(String(source.ids[0]));
    const leaf = columns.leaves[index];
    if (!sourceCell || !leaf) return null;
    const target = sourceCell.isGroup
      ? columns.headerCellAt(sourceCell.level, index)
      : columns.headerCell(leaf.id);
    if (!target || !this.columnReorderable(target.def)) return null;
    return this.canDropOnto(source, target.id) ? { targetId: target.id, position: "onto" } : null;
  }

  private columnPlacement(drag: ActiveDrag, x: number): Placement<RowId> | null {
    const { columns } = this.host;
    const siblings = columns.siblingsOf(String(drag.source.ids[0]));
    const first = siblings[0];
    const last = siblings[siblings.length - 1];
    if (!first || !last) return null;
    const index = this.host.columnIndexAtX(x);
    if (index < first.first || index > last.last) {
      const onto = this.columnOnto(drag.source, index);
      if (onto) return onto;
    }
    let placement: Placement<string> | null = null;
    if (index < first.first) placement = { targetId: first.id, position: "before" };
    else if (index > last.last) placement = { targetId: last.id, position: "after" };
    else {
      const cell = columns.headerCellAt(first.level, index);
      if (cell) {
        const { left, right } = this.host.columnSpanX(cell.first, cell.last);
        const position = this.slot(drag.source, cell.id, (x - left) / Math.max(1, right - left));
        if (!position) return null;
        placement = { targetId: cell.id, position };
      }
    }
    const target = placement && columns.headerCell(placement.targetId);
    if (!placement || !target || !this.columnReorderable(target.def)) return null;
    return this.allowed(
      drag.source,
      settleGap(
        listAxis(siblings.map((sibling) => sibling.id)),
        new Set(drag.source.ids.map(String)),
        drag.contiguous,
        placement,
      ),
    );
  }
}
