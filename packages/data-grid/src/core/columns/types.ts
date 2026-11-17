import type { DragHandleProps } from "../dnd/types";
import type { MenuAnchorEvent, MenuEntry } from "../menu";
import type { RowId } from "../rows/rowNode";
import type { CellRange } from "../selection/types";

export const TONES = ["neutral", "brand", "info", "success", "warning", "danger"] as const;

export type CellTone = (typeof TONES)[number];

export interface RowContext<TRow> {
  row: TRow;
  rowId: RowId;
  /** Display index; `-1` for a pinned row. */
  rowIndex: number;
  /** Tree depth, 0 for top-level rows. */
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
}

export interface CellContext<TRow> extends RowContext<TRow> {
  columnId: string;
  columnIndex: number;
  value: unknown;
}

export interface CellRenderContext<TRow> extends CellContext<TRow> {
  /** The value after `format`, or as a string when there is none. */
  formattedValue: string;
  /** Opens the cell's `menu` at the event's `currentTarget`, which gets focus back when it closes. */
  openMenu: (event: MenuAnchorEvent) => void;
  /** Spread onto a grip to drag this cell's row; set while `onRowsDrop` is given and the row may move. */
  dragHandleProps?: DragHandleProps;
}

/** What a cell menu acts on: the whole selection when the cell is in it, else the cell alone. */
export interface CellMenuContext<TRow> extends CellRenderContext<TRow> {
  rowIds: readonly RowId[];
  columnIds: readonly string[];
  ranges: readonly CellRange[];
}

/** Runtime colours for one cell; any CSS colour, including `var(--colors-…)`. */
export interface CellColors {
  background?: string;
  color?: string;
}

/**
 * How a cell looks and behaves. Set at grid (`defaultCell`), column (`column.cell`) and cell
 * (`getCell`) scope; each scope's defined keys override the previous one's.
 */
export interface CellSpec<TRow, TNode = unknown> {
  /** Text shown for the value. Defaults to the value as text: dates as ISO, objects as JSON, nullish empty. */
  format?: (value: unknown, ctx: CellContext<TRow>) => string;
  /** Custom content in place of the formatted text. */
  render?: (ctx: CellRenderContext<TRow>) => TNode;
  tone?: CellTone;
  style?: CellColors;
  tooltip?: TNode | ((ctx: CellRenderContext<TRow>) => TNode);
  /** Items for the cell's context menu; none, or an empty list, leaves the browser's menu. */
  menu?: (ctx: CellMenuContext<TRow>) => readonly MenuEntry<TNode>[] | undefined;
  /** F2 or double-click edits the cell's text in place; Enter commits through `onCellsChange`. */
  editable?: boolean;
  /** The value `onCellsChange` reports for the typed text. Defaults to the text. */
  parse?: (text: string, ctx: CellContext<TRow>) => unknown;
}

export type PinnedSide = "left" | "right";

export interface HeaderContext<TRow, TNode = unknown> {
  columnId: string;
  def: ColumnDef<TRow, TNode>;
  /** Header level, 0 at the top. */
  level: number;
  isGroup: boolean;
  /** Opens the header's `menu` at the event's `currentTarget`, which gets focus back when it closes. */
  openMenu: (event: MenuAnchorEvent) => void;
  /** Spread onto a grip to drag this column or group; set while `onColumnsDrop` is given and it may move. */
  dragHandleProps?: DragHandleProps;
}

/** What a header menu acts on: the selected columns or groups when this one is among them, else this one. */
export interface HeaderMenuContext<TRow, TNode = unknown> extends HeaderContext<TRow, TNode> {
  ids: readonly string[];
}

export interface ColumnDef<TRow, TNode = unknown> {
  id: string;
  /** Header label, or custom header content. */
  header?: string | ((ctx: HeaderContext<TRow, TNode>) => TNode);
  /** Plain-text header for a custom `header`: a rename starts from it and a drag shows it. Defaults to a string `header`, else the id. */
  headerText?: string;
  /** Double-click renames the header in place; Enter commits through `onHeaderRename`. */
  headerEditable?: boolean;
  /** Runtime `background` / `color` for this column's or group's header cell; selection still shows over it. */
  headerStyle?: CellColors;
  /** Row key holding the value; `getValue` takes precedence. */
  field?: Extract<keyof TRow, string>;
  getValue?: (row: TRow) => unknown;
  /** Width in px. Defaults to 150. */
  width?: number;
  /** Defaults to 40. */
  minWidth?: number;
  maxWidth?: number;
  /** Share of the centre region's free width, in place of `width`. Pinned columns ignore it. */
  flex?: number;
  /** Initial pin. Pinning a column pins its whole top-level group. */
  pinned?: PinnedSide;
  /** Initial visibility. */
  hidden?: boolean;
  /** Defaults to `true`. */
  resizable?: boolean;
  /** Its cells are row headers for screen readers, and tree rows indent and toggle here. */
  rowHeader?: boolean;
  /** Whether clicking the header selects the column or group. Defaults to `true`. */
  selectable?: boolean;
  /** Clicking its cells selects their row, as the row-number gutter does, instead of starting a cell range. */
  selectsRow?: boolean;
  /** Whether it can be dragged or moved, and be a drop's target, while `onColumnsDrop` is given. Defaults to `true`. */
  reorderable?: boolean;
  /** Items for the header's context menu, for a leaf or a group. */
  menu?: (ctx: HeaderMenuContext<TRow, TNode>) => readonly MenuEntry<TNode>[] | undefined;
  /** Columns this cell spans to the right, clipped at its pinned region's edge and before a cell an earlier merge covers. */
  colSpan?: (row: TRow, ctx: CellContext<TRow>) => number;
  /** Rows this cell spans down, or `"sameValue"` to merge a run of equal values. Stops at parent and full-width rows; dropped when its first cell lies inside an earlier merge. */
  rowSpan?: ((row: TRow, ctx: CellContext<TRow>) => number) | "sameValue";
  cell?: CellSpec<TRow, TNode>;
  /** Makes this a column group over these columns. */
  children?: readonly ColumnDef<TRow, TNode>[];
}

/** Widths in px the user has set, by leaf column id. */
export type ColumnSizing = Readonly<Record<string, number>>;

/** Pins by top-level column id; `false` unpins a column whose def pins it. */
export type ColumnPinning = Readonly<Record<string, PinnedSide | false>>;

/** Visibility by leaf column id, over `ColumnDef.hidden`. */
export type ColumnVisibility = Readonly<Record<string, boolean>>;

/** Heights in px the user has set, by row id. */
export type RowSizing = Readonly<Record<string, number>>;
