import type { ColumnState } from "../columns/columnModel";
import type { ColumnPinning, ColumnSizing, ColumnVisibility, RowSizing } from "../columns/types";
import type { RowId } from "../rows/rowNode";

const VERSION = 2;

export interface DataGridState extends ColumnState {
  version: typeof VERSION;
  expandedRowIds: readonly RowId[];
  rowSizing: RowSizing;
}

export type StateSlices = Omit<DataGridState, "version">;

export type StateKey = keyof StateSlices;

export interface StateOptions extends Partial<StateSlices> {
  /** Widths the user set, by column id. Controlled when given; resizing calls `onColumnSizingChange` once, on release. */
  columnSizing?: ColumnSizing;
  onColumnSizingChange?: (sizing: ColumnSizing) => void;
  /** Pins by top-level column id, over `ColumnDef.pinned`. Controlled when given. */
  columnPinning?: ColumnPinning;
  onColumnPinningChange?: (pinning: ColumnPinning) => void;
  /** Visibility by column id, over `ColumnDef.hidden`. Controlled when given. */
  columnVisibility?: ColumnVisibility;
  onColumnVisibilityChange?: (visibility: ColumnVisibility) => void;
  /** Open tree rows. Controlled when given; parents start collapsed. */
  expandedRowIds?: readonly RowId[];
  onExpandedRowIdsChange?: (ids: readonly RowId[]) => void;
  /** Heights the user set, by row id. Controlled when given; resizing calls `onRowSizingChange` once, on release. */
  rowSizing?: RowSizing;
  onRowSizingChange?: (sizing: RowSizing) => void;
  /** Called with a new snapshot whenever the user changes column state. */
  onStateChange?: (state: DataGridState) => void;
}

export const STATE_OPTION_KEYS = {
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
} as const satisfies Record<keyof StateOptions, true>;

export const STATE_CALLBACKS: {
  [K in StateKey]: (options: StateOptions) => ((value: StateSlices[K]) => void) | undefined;
} = {
  columnSizing: (options) => options.onColumnSizingChange,
  columnPinning: (options) => options.onColumnPinningChange,
  columnVisibility: (options) => options.onColumnVisibilityChange,
  expandedRowIds: (options) => options.onExpandedRowIdsChange,
  rowSizing: (options) => options.onRowSizingChange,
};

export const STATE_KEYS = Object.keys(STATE_CALLBACKS) as readonly StateKey[];

export const toSnapshot = (slices: StateSlices): DataGridState => ({ version: VERSION, ...slices });

export function sameSlice(a: object, b: object): boolean {
  if (a === b) return true;
  const entries = Object.entries(a);
  const other = b as Readonly<Record<string, unknown>>;
  return (
    entries.length === Object.keys(b).length &&
    entries.every(([key, value]) => Object.hasOwn(b, key) && Object.is(value, other[key]))
  );
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const record = <T>(value: unknown): T => (isRecord(value) ? (value as T) : ({} as T));

export function migrateState(state: unknown): DataGridState {
  if (!isRecord(state) || (state.version !== 1 && state.version !== VERSION)) {
    throw new Error(
      `DataGrid: unsupported state version ${JSON.stringify(isRecord(state) ? state.version : state)}`,
    );
  }
  return toSnapshot({
    columnSizing: record<ColumnSizing>(state.columnSizing),
    columnPinning: record<ColumnPinning>(state.columnPinning),
    columnVisibility: record<ColumnVisibility>(state.columnVisibility),
    expandedRowIds: Array.isArray(state.expandedRowIds) ? (state.expandedRowIds as RowId[]) : [],
    rowSizing: record<RowSizing>(state.rowSizing),
  });
}
