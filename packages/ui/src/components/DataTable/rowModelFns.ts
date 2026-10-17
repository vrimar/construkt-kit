import {
  formatIsoDate,
  matchesNumberFilter,
  type NumberFilterValue,
  parseDateRangeFilter,
  parseNumberFilter,
} from "@construkt-kit/utils";
import {
  constructFilterFn,
  constructSortFn,
  type FilterFn,
  sortFn_alphanumeric,
} from "@tanstack/react-table";

import type { ColumnFilterType, DataTableColumnDef } from "./types";

const filterValues = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [value])
    .filter((item) => item !== null && item !== undefined && item !== "")
    .map(String);

const toText = (value: unknown, label: (item: string) => string = (item) => item): string =>
  Array.isArray(value)
    ? value.map((item) => toText(item, label)).join(", ")
    : typeof value === "string" || typeof value === "number" || typeof value === "boolean"
      ? label(String(value))
      : "";

const toIsoDay = (value: unknown) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : typeof value === "string" ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return undefined;
  return formatIsoDate({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
};

const inputFilter = constructFilterFn({
  resolveFilterValue: (value) => filterValues(value).map((text) => text.toLowerCase()),
  filter: (cell, needles: string[]) =>
    needles.length === 0 || needles.some((needle) => toText(cell).toLowerCase().includes(needle)),
});

const selectFilter = constructFilterFn({
  resolveFilterValue: (value) => new Set(filterValues(value)),
  filter: (cell, selected: Set<string>) =>
    selected.size === 0 ||
    (Array.isArray(cell) ? cell : [cell]).some(
      (item) => item !== null && item !== undefined && selected.has(String(item)),
    ),
});

const numberFilter = constructFilterFn({
  resolveFilterValue: (value) => filterValues(value).flatMap((raw) => parseNumberFilter(raw) ?? []),
  filter: (cell, filters: NumberFilterValue[]) =>
    filters.length === 0 ||
    (typeof cell === "number" && filters.some((filter) => matchesNumberFilter(cell, filter))),
});

const dateFilter = constructFilterFn({
  resolveFilterValue: (value) =>
    filterValues(value).flatMap((raw) => {
      const range = parseDateRangeFilter(raw);
      return range ? [range] : [];
    }),
  filter: (cell, ranges: [start: string, end: string][]) => {
    if (ranges.length === 0) return true;
    const day = toIsoDay(cell);
    return day !== undefined && ranges.some(([start, end]) => day >= start && day <= end);
  },
});

export const dataTableFilterFns = {
  input: inputFilter,
  select: selectFilter,
  number: numberFilter,
  date: dateFilter,
} satisfies Record<ColumnFilterType, FilterFn<any, any>>;

const sortByLabel = (label?: (item: string) => string) =>
  constructSortFn({
    ...sortFn_alphanumeric,
    resolveDataValue: (value) => toText(value, label).toLowerCase(),
  });

export const withColumnDefaults = <TData extends object>(
  defs: readonly DataTableColumnDef<TData, any>[],
): DataTableColumnDef<TData, any>[] =>
  defs.map((def) => {
    const type = def.meta?.type ?? "input";
    return {
      ...def,
      ...((def.filterFn === undefined || def.filterFn === "auto") && { filterFn: type }),
      ...(def.sortFn === undefined &&
        type === "select" && { sortFn: sortByLabel(def.meta?.selectProps?.getItemLabel) }),
      ...(def.sortUndefined === undefined && { sortUndefined: "last" }),
      ...("columns" in def && def.columns && { columns: withColumnDefaults(def.columns) }),
    } as DataTableColumnDef<TData, any>;
  });

const collator = new Intl.Collator(undefined, { numeric: true });

export const facetOptions = (facets: Map<unknown, number>): string[] =>
  [...new Set(filterValues([...facets.keys()].flat()))].sort(collator.compare);
