import type { DataTableLabels } from "./types";

type ControlLabel =
  | "clearSearch"
  | "clearNumber"
  | "numberFrom"
  | "numberTo"
  | "numberOperators"
  | "clearDate";

export type ResolvedLabels = Required<Omit<DataTableLabels, ControlLabel>> &
  Pick<DataTableLabels, ControlLabel>;

const defaultLabels: Required<Omit<DataTableLabels, ControlLabel>> = {
  noResults: "No results available.",
  resetFilters: "Reset filters",
  items: "Items",
  item: "Item",
  page: "Page",
  outOf: "out of",
  filterBy: "Filter by",
  sortBy: "Sort by",
  firstPage: "First page",
  previousPage: "Previous page",
  nextPage: "Next page",
  lastPage: "Last page",
  sort: "Sort",
  filters: "Filters",
  ascending: "Ascending",
  descending: "Descending",
  clearSort: "Clear",
  done: "Done",
  removeFilter: "Remove filter",
  columns: "Columns",
  showAllColumns: "Show all",
  resizeColumn: "Resize",
};

export const resolveLabels = (labels: DataTableLabels | undefined): ResolvedLabels => {
  const given = Object.fromEntries(
    Object.entries(labels ?? {}).filter(([, value]) => value !== undefined),
  ) as DataTableLabels;
  const resolved = { ...defaultLabels, ...given };
  if (labels?.items !== undefined && labels.item === undefined) resolved.item = labels.items;
  return resolved;
};
