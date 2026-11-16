import type {
  DataTableColumn,
  DataTableColumnDef,
  DataTableColumnMeta,
  DataTableInstance,
  ResolvedColumnMeta,
} from "./types";

const identity = (item: string) => item;

export const listedColumns = <TData extends object>(defs: DataTableColumnDef<TData, any>[]) =>
  defs.filter((def) => def.meta?.isVisible !== false);

// The cast holds only for column defs whose `meta.type` was already resolved.
export const columnMeta = <TData extends object>(column: DataTableColumn<TData, any>) =>
  column.columnDef.meta as ResolvedColumnMeta;

export const selectItemLabel = (meta: DataTableColumnMeta | undefined) =>
  meta?.selectProps?.getItemLabel ?? identity;

export const filterValues = (value: unknown): string[] => {
  const items: unknown[] = Array.isArray(value) ? value : [value];
  return items.every((item) => typeof item === "string" && item !== "")
    ? (items as string[])
    : items.filter((item) => item !== null && item !== undefined && item !== "").map(String);
};

export const getFilterValues = <TData extends object>(column: DataTableColumn<TData, any>) =>
  filterValues(column.getFilterValue());

// `table.getLeafHeaders()` also returns the placeholder and group headers above each leaf.
export const getLeafHeaders = <TData extends object>(table: DataTableInstance<TData>) =>
  table.getHeaderGroups().at(-1)?.headers ?? [];

const collator = new Intl.Collator(undefined, { numeric: true });

export const facetOptions = (facets: Map<unknown, number>): string[] =>
  [...new Set(filterValues([...facets.keys()].flat()))].sort(collator.compare);
