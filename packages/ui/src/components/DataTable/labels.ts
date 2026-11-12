import type { DataTableLabels } from "./types";

const defaultLabels: Required<DataTableLabels> = {
  noResults: "No results available.",
  resetFilters: "Reset filters",
  items: "Items",
  item: "Item",
  page: "Page",
  outOf: "out of",
  filterBy: "Filter by",
  sortBy: "Sort by",
  clearSearch: "Clear search",
  clearNumber: "Clear filter",
  clearDate: "Clear date",
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

export const resolveLabels = (labels: DataTableLabels | undefined): Required<DataTableLabels> => {
  const resolved = { ...defaultLabels };
  for (const key of Object.keys(defaultLabels) as (keyof DataTableLabels)[]) {
    resolved[key] = labels?.[key] ?? defaultLabels[key];
  }
  if (labels?.items !== undefined && labels.item === undefined) resolved.item = labels.items;
  return resolved;
};
