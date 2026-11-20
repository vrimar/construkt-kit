import type { BoxProps } from "@construkt-kit/ui";
import type { MouseEvent, ReactNode, Ref } from "react";

import type {
  CellRenderContext,
  CellSpec as CoreCellSpec,
  ColumnDef as CoreColumnDef,
  HeaderContext as CoreHeaderContext,
  HeaderMenuContext as CoreHeaderMenuContext,
  PinnedSide,
  RowContext,
} from "../core/columns/types";
import type {
  ColumnsDrop as CoreColumnsDrop,
  DragHandleProps,
  DragSource,
  DropPosition,
  RowsDrop as CoreRowsDrop,
} from "../core/dnd/types";
import type { GridOptions, VisibleRange } from "../core/grid";
import type { HitRegion } from "../core/layout/hit";
import type { MenuEntry as CoreMenuEntry, MenuItem as CoreMenuItem } from "../core/menu";
import type { RowId } from "../core/rows/rowNode";
import type {
  CellAddress,
  CellRange,
  EntityKind,
  FlashTargets,
  RangeStats,
  SelectionDetails,
} from "../core/selection/types";
import type { DataGridState } from "../core/state/snapshot";

export type CellSpec<TRow> = CoreCellSpec<TRow, ReactNode>;
export type ColumnDef<TRow> = CoreColumnDef<TRow, ReactNode>;
export type HeaderContext<TRow> = CoreHeaderContext<TRow, ReactNode>;
export type HeaderMenuContext<TRow> = CoreHeaderMenuContext<TRow, ReactNode>;
export type MenuItem = CoreMenuItem<ReactNode>;
export type MenuEntry = CoreMenuEntry<ReactNode>;
export type {
  CellColors,
  CellContext,
  CellMenuContext,
  CellRenderContext,
  CellTone,
  ColumnPinning,
  ColumnSizing,
  ColumnVisibility,
  PinnedSide,
  RowContext,
  RowSizing,
} from "../core/columns/types";
export type {
  DragHandleEvent,
  DragHandleProps,
  DragSource,
  DropIndicator,
  DropPosition,
} from "../core/dnd/types";
export type { CellChange, HeaderRename } from "../core/editing/controller";
export type { VisibleRange } from "../core/grid";
export type { HitRegion } from "../core/layout/hit";
export type { MenuAnchorEvent, MenuSeparator } from "../core/menu";
export type { RowId } from "../core/rows/rowNode";
export type { SelectionMode } from "../core/selection/controller";
export type {
  CellAddress,
  CellRange,
  EntityKind,
  EntitySelection,
  FlashTargets,
  RangeStats,
  SelectionDetails,
} from "../core/selection/types";
export type { DataGridState } from "../core/state/snapshot";

/** What lies under a viewport point. */
export interface GridHit {
  /** `"top"` and `"bottom"` are the pinned rows. */
  region: HitRegion;
  /** `null` in the header, and below the last row. */
  rowId: RowId | null;
  /** `null` over the row-number gutter, and past the last column. */
  columnId: string | null;
  /** The leaf or group header under the point, in the header. */
  headerId: string | null;
  /** Where the point sits across the cell, or header cell: 0 at its left or top edge, 1 at the other. */
  fractionX: number;
  fractionY: number;
  /** The cell, or header cell, in viewport coordinates. */
  rect: DOMRect;
}

export interface RowsDrop extends CoreRowsDrop {
  /** The target row's rect in the viewport, to anchor a follow-up such as a merge picker. */
  rect: DOMRect | null;
  /** Where the pointer let go; `null` after a keyboard move. */
  point: { x: number; y: number } | null;
}

export interface ColumnsDrop extends CoreColumnsDrop {
  /** The target header's rect in the viewport. */
  rect: DOMRect | null;
  /** Where the pointer let go; `null` after a keyboard move. */
  point: { x: number; y: number } | null;
}

/** Where a grip drag is, as `onDragMove` reports it on each move. */
export interface DragOver {
  /** What lies under the pointer; `null` outside the grid's scroll area. */
  hit: GridHit | null;
  /**
   * The within-axis placement the grid would drop on, as `onRowsDrop` / `onColumnsDrop` would get it; `null` while
   * across, or where a drop would change nothing.
   */
  placement: { targetId: RowId; position: DropPosition } | null;
  /** The pointer in the viewport. */
  point: { x: number; y: number };
  /** The pointer is over the other axis (see `canDropAcross`). */
  across: boolean;
  /** Across, and `canDropAcross` allows it. */
  acrossAllowed: boolean;
}

/** A dashed box around rows or columns, such as where something is about to land. */
export type GridOutline =
  | {
      kind: "rows";
      /** Body rows; the box runs from the first of them to the last, over every column. */
      ids: readonly RowId[];
    }
  | {
      kind: "columns";
      /** Leaf or group ids in one pinned region; the box runs from their header to the last row. */
      ids: readonly string[];
    };

/** A drag from outside the grid, such as a list item or a file. */
export interface ExternalDragEvent {
  /** `null` when the point is over none of the grid's cells. */
  hit: GridHit | null;
  types: readonly string[];
  /** `null` when the grid re-reads the target after scrolling under a still pointer. */
  dataTransfer: DataTransfer | null;
}

export interface DataGridApi {
  /** Scrolls the least distance that brings the cell fully into view. */
  scrollToCell(cell: CellAddress): void;
  /** The cell's viewport rect while it is mounted, else `null`. */
  getCellRect(cell: CellAddress): DOMRect | null;
  /** Runs a named command, such as `"moveDown"`; `false` when it is unknown or did nothing. */
  runCommand(name: string): boolean;
  getState(): DataGridState;
  /** Applies a snapshot from `getState`; each slice it changes goes through its `on…Change` callback. */
  restoreState(state: DataGridState): void;
  /** Fits columns, or a group's columns, to their header and mounted cells. Defaults to every column. */
  autosizeColumns(columnIds?: readonly string[]): void;
  /** Drops the user's width for a column or a group's columns. */
  resetColumnWidth(columnId: string): void;
  setColumnHidden(columnId: string, hidden: boolean): void;
  /** Pins or unpins a column's whole top-level group. */
  setColumnPinned(columnId: string, side: PinnedSide | false): void;
  setRowExpanded(rowId: RowId, expanded: boolean): void;
  /** Drops the user's height for a row. */
  resetRowHeight(rowId: RowId): void;
  /** Writes what Mod+C would copy to the clipboard as TSV and HTML; `false` when there is nothing to copy. */
  copy(): Promise<boolean>;
  /** The range's viewport rect, mounted or not, for anchoring a toolbar to a selection. */
  getRangeRect(range: CellRange): DOMRect | null;
  /** Briefly highlights rows, columns or cells, such as ones that just changed. */
  flash(targets: FlashTargets): void;
  /** Focuses the column's resize edge: Left and Right resize it, Shift for larger steps; Enter or Escape returns to the grid. */
  startColumnResize(columnId: string): void;
  /** What lies under a viewport point, mounted or not; `null` outside the grid's scroll area. */
  hitTest(clientX: number, clientY: number): GridHit | null;
  /** Opens the cell's editor; `false` when its `CellSpec` isn't `editable`. */
  editCell(cell: CellAddress): boolean;
  /** Opens the header's rename editor; `false` when the column isn't `headerEditable`. */
  renameHeader(columnId: string): boolean;
}

export interface CommandContext extends SelectionDetails {
  api: DataGridApi;
  activeCell: CellAddress | null;
}

/** An app command; returning `false` falls through to the built-in command or binding beneath it. */
export type DataGridCommand = (ctx: CommandContext) => boolean | void;

export interface StatusBarContext extends SelectionDetails {
  /** Over the cell ranges, or the selected rows or columns; `null` with neither. */
  stats: RangeStats | null;
}

export interface FullWidthRowContext<TRow> extends RowContext<TRow> {
  toggleExpanded: () => void;
  /** Spread onto a grip to drag the row; set while `onRowsDrop` is given and the row may move. */
  dragHandleProps?: DragHandleProps;
}

export interface DataGridLabels {
  loading: string;
  empty: string;
  loaded: (rowCount: number) => string;
  expandRow: string;
  collapseRow: string;
  selectRow: string;
  selectAllRows: string;
  resizeColumn: string;
  /** Announced when Mod+C meets ranges that share neither rows nor columns. */
  copyRefused: string;
  /** Announced after Mod+C copies. */
  copied: string;
  /** Announced once a keyboard move has been applied, numbered as screen readers number rows: header rows count. */
  rowMoved: (position: number, rowCount: number) => string;
  columnMoved: (position: number, columnCount: number) => string;
  /** Shown beside the pointer while dragging several rows or columns. */
  dragging: (count: number) => string;
  /** Names the header rename field for screen readers. */
  renameHeader: string;
  /** Announced after a selection key, such as Shift+Arrow or Space, with what is now selected; 0 when it was cleared. */
  selected: (count: number, kind: EntityKind | "cells") => string;
  /** Reads a column's width on its keyboard resize edge. */
  columnWidth: (width: number) => string;
}

export interface DataGridVariantProps {
  /** Row height, padding and text size. Defaults to `"md"`. */
  size?: "sm" | "md" | "lg";
  /** `"outline"` frames the grid. Defaults to `"outline"`. */
  variant?: "outline" | "plain";
  striped?: boolean;
  /** Defaults to `"both"`. */
  gridLines?: "both" | "rows" | "columns" | "none";
}

type HostOption =
  | "dragHandles"
  | "onKeyboardMove"
  | "onRowsDrop"
  | "onColumnsDrop"
  | "canDropAcross"
  | "onDropAcross";

export interface DataGridOwnProps<TRow>
  extends DataGridVariantProps, Omit<GridOptions<TRow, ReactNode>, HostOption> {
  loading?: boolean;
  /** Shown in place of rows when there are none. */
  emptyState?: ReactNode;
  toolbar?: ReactNode;
  /** Content under the grid, or a function of the selection and its stats. */
  statusBar?: ReactNode | ((ctx: StatusBarContext) => ReactNode);
  labels?: Partial<DataGridLabels>;
  apiRef?: Ref<DataGridApi>;
  /** Shows a row-number gutter, pinned left. */
  rowNumbers?: boolean;
  /** `false` takes away the gutter and row-header handles that drag a row's height. Default `true`. */
  resizableRows?: boolean;
  renderFullWidthRow?: (ctx: FullWidthRowContext<TRow>) => ReactNode;
  /** Dashed boxes drawn over the grid, around rows or columns. */
  outlines?: readonly GridOutline[];
  /** The rows in view, from the parent stuck at the top edge, if any, to the last row showing. */
  onVisibleRangeChange?: (range: VisibleRange) => void;
  onCellClick?: (ctx: CellRenderContext<TRow>, event: MouseEvent<HTMLElement>) => void;
  onHeaderClick?: (ctx: HeaderContext<TRow>, event: MouseEvent<HTMLElement>) => void;
  /**
   * `"add"`: a plain click on a column or group header, the row-number gutter or a `selectsRow` cell toggles it in
   * the selection, as Mod-click does; a click on another kind starts over. Shift and cell clicks are unchanged.
   * @default "replace"
   */
  pointerSelection?: "replace" | "add";
  /** Bindings over the built-in keymap, from a shortcut such as `"Mod+D"` to a command name; `null` unbinds. */
  keymap?: Readonly<Record<string, string | null>>;
  /** `false` swallows the keys that select or extend ranges, rows and columns; Escape still clears. Default `true`. */
  keyboardSelection?: boolean;
  /** App commands by name, run from `keymap`, `apiRef.runCommand` or before a built-in of the same name. */
  commands?: Readonly<Record<string, DataGridCommand>>;
  /**
   * Called when rows are dropped from a grip, or moved with Alt+Shift+Up/Down. Order stays
   * controlled: apply it to `rows`. A selected row drags the selected rows that share its parent.
   */
  onRowsDrop?: (drop: RowsDrop) => void;
  /** Called when columns or groups are dropped from a grip, or moved with Alt+Shift+Left/Right; apply it to `columnDefs`. */
  onColumnsDrop?: (drop: ColumnsDrop) => void;
  /** Called on every pointer move of a grip drag, and with `null` when it ends, by a drop or a cancel. */
  onDragMove?: (source: DragSource, over: DragOver | null) => void;
  /**
   * Whether a grip drag may land on the other axis at `hit`: a column dragged over a row header (the gutter or a
   * `rowHeader` column's cell), or a row dragged over the header (a leaf, a group, or the top-left label header).
   * Asked on each move while over the other axis; elsewhere the drag keeps its own axis.
   * Without it a drag stays on its own axis.
   */
  canDropAcross?: (source: DragSource, hit: GridHit) => boolean;
  /** Called on release over the other axis where `canDropAcross` allowed it; no `onColumnsDrop` / `onRowsDrop` fires then. */
  onDropAcross?: (source: DragSource, hit: GridHit, point: { x: number; y: number }) => void;
  /** The drag ghost's text; `undefined` falls back to the built-in label: the item's text, or `labels.dragging`. */
  dragLabel?: (source: DragSource) => string | undefined;
  /** Called as an external drag moves or the grid scrolls under it; return `true` to accept a drop at that point. */
  onExternalDragOver?: (event: ExternalDragEvent) => boolean;
  onExternalDrop?: (event: ExternalDragEvent) => void;
  /** Called when an external drag leaves the grid or ends without a drop. */
  onExternalDragLeave?: () => void;
}

export type DataGridProps<TRow> = DataGridOwnProps<TRow> &
  Omit<BoxProps, keyof DataGridOwnProps<TRow> | "children">;
