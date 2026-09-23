import { isValidNumber } from "./number";

export type DataTableFilters = Record<string, string[] | undefined>;

export type DataTableSortType = "asc" | "desc" | "";

/** Paging/sorting/filtering contract shared by the table component and the HTTP client.
 *  The index signature carries app-specific filter keys through to the query string. */
export interface DataTableParams extends Record<string, any> {
  page: number;
  pageSize: number;
  orderBy: string;
  orderType: DataTableSortType;
  filters: DataTableFilters;
}

/** Separates the two bounds of a range filter packed into one filter string. */
export const FILTER_RANGE_SEPARATOR = "<>";

export const NUMBER_FILTER_OPERATORS = ["eq", "gt", "gte", "lt", "lte", "between"] as const;

export type NumberFilterOperator = (typeof NUMBER_FILTER_OPERATORS)[number];

export type NumberFilterValue =
  | { operator: Exclude<NumberFilterOperator, "between">; value: number; to?: undefined }
  | { operator: "between"; value: number; to: number };

/** Encodes a numeric filter into the single-string form carried by {@link DataTableFilters},
 *  e.g. `"gte:100"` or `"between:100<>200"`. */
export function serializeNumberFilter(filter: NumberFilterValue): string {
  if (filter.operator === "between")
    return `between:${filter.value}${FILTER_RANGE_SEPARATOR}${filter.to}`;
  return `${filter.operator}:${filter.value}`;
}

/** Decodes a filter string produced by {@link serializeNumberFilter}; a bare number
 *  is accepted as `eq`. Returns undefined for anything malformed. */
export function parseNumberFilter(raw: string): NumberFilterValue | undefined {
  if (isValidNumber(raw)) return { operator: "eq", value: Number(raw) };

  const separatorIndex = raw.indexOf(":");
  if (separatorIndex === -1) return undefined;
  const operator = raw.slice(0, separatorIndex);
  const operand = raw.slice(separatorIndex + 1);

  if (operator === "between") {
    const bounds = operand.split(FILTER_RANGE_SEPARATOR);
    if (bounds.length !== 2 || !bounds.every(isValidNumber)) return undefined;
    return { operator, value: Number(bounds[0]), to: Number(bounds[1]) };
  }

  if (!isComparisonOperator(operator) || !isValidNumber(operand)) return undefined;
  return { operator, value: Number(operand) };
}

/** Formats a calendar date as ISO `YYYY-MM-DD`, the date form carried by {@link DataTableFilters}. */
export function formatIsoDate({ year, month, day }: { year: number; month: number; day: number }) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const isIsoDate = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

/** Encodes an inclusive ISO date range into one filter string, e.g. `"2024-01-01<>2024-01-31"`. */
export function serializeDateRangeFilter(start: string, end: string): string {
  return `${start}${FILTER_RANGE_SEPARATOR}${end}`;
}

/** Decodes a filter string produced by {@link serializeDateRangeFilter}. Returns undefined
 *  for anything that is not two valid ISO dates. */
export function parseDateRangeFilter(raw: string): [start: string, end: string] | undefined {
  const bounds = raw.split(FILTER_RANGE_SEPARATOR);
  if (bounds.length !== 2 || !bounds.every(isIsoDate)) return undefined;
  return [bounds[0], bounds[1]];
}

/** Evaluates a numeric filter against a cell value; `between` is inclusive on both ends. */
export function matchesNumberFilter(cell: number, filter: NumberFilterValue): boolean {
  switch (filter.operator) {
    case "eq":
      return cell === filter.value;
    case "gt":
      return cell > filter.value;
    case "gte":
      return cell >= filter.value;
    case "lt":
      return cell < filter.value;
    case "lte":
      return cell <= filter.value;
    case "between":
      return cell >= filter.value && cell <= filter.to;
  }
}

function isComparisonOperator(value: string): value is Exclude<NumberFilterOperator, "between"> {
  return value !== "between" && (NUMBER_FILTER_OPERATORS as readonly string[]).includes(value);
}
