import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
} from "@tanstack/react-table";
import { functionalUpdate, useTable } from "@tanstack/react-table";
import React, { useCallback, useMemo } from "react";

import { type BoxProps, Stack } from "#styled-system/jsx";

import { useIsMobile } from "../../hooks";
import { DataTableBody } from "./Body";
import { DataTableCards } from "./Cards";
import { DEFAULT_MIN_COLUMN_WIDTH } from "./columnTemplate";
import { DataTableProvider, type DataTableContextValue } from "./context";
import { DataTablePagination } from "./Pagination";
import type {
  DataTableColumnDef,
  DataTableLabels,
  DataTableParams,
  DataTableRow,
  TableFilterSelections,
} from "./types";
import { dataTableFeatures } from "./types";

export type {
  DataTableCell,
  DataTableColumnAlign,
  DataTableColumnDef,
  DataTableColumnMeta,
  DataTableFeatures,
  DataTableFilters,
  DataTableHeader as DataTableHeaderType,
  DataTableInstance,
  DataTableLabels,
  DataTableParams,
  DataTableRow,
  DataTableSelectProps,
  DataTableSortType,
  DataTableTableMeta,
  TableFilterSelections,
} from "./types";
export { dataTableFeatures } from "./types";

export type DataTableProps<TData extends object> = {
  data: TData[];
  totalItems: number;
  columns: DataTableColumnDef<TData, any>[];
  loading?: boolean;
  params: DataTableParams;
  onParamChange: (params: DataTableParams) => unknown;
  onRowClick?: (row: DataTableRow<TData>) => unknown;
  onReset?: () => unknown;
  getRowProps?: (row: DataTableRow<TData>) => BoxProps;
  renderSubRow?: (row: DataTableRow<TData>) => React.ReactNode;
  selections?: TableFilterSelections;
  showPagination?: boolean;
  showFiltersRow?: boolean;
  variant?: "default" | "basic";
  labels?: DataTableLabels;
  /**
   * How the table adapts below the `md` breakpoint.
   * - `"scroll"` (default): keep the grid layout.
   * - `"cards"`: render each row as a stacked label/value card.
   */
  mobileLayout?: "scroll" | "cards";
};

const defaultLabels: Required<DataTableLabels> = {
  noResults: "No results available.",
  resetFilters: "Reset filters",
  items: "Items",
  page: "Page",
  outOf: "out of",
  filterBy: "Filter by",
  firstPage: "First page",
  previousPage: "Previous page",
  nextPage: "Next page",
  lastPage: "Last page",
};

const resolveLabels = (labels: DataTableLabels | undefined): Required<DataTableLabels> => {
  const resolved = { ...defaultLabels };
  for (const key of Object.keys(defaultLabels) as (keyof DataTableLabels)[]) {
    resolved[key] = labels?.[key] ?? defaultLabels[key];
  }
  return resolved;
};

// Portalled overlays re-dispatch React events through the row without being inside it.
const isNestedControl = (event: React.SyntheticEvent<HTMLDivElement>) =>
  !(event.target instanceof Element && event.currentTarget.contains(event.target)) ||
  !!event.target.closest("button, a");

export const DataTable = <TData extends object>({
  data,
  params,
  onParamChange,
  columns,
  loading,
  totalItems,
  onRowClick,
  onReset,
  renderSubRow,
  selections,
  showPagination = true,
  showFiltersRow = true,
  getRowProps,
  variant,
  labels,
  mobileLayout = "scroll",
}: DataTableProps<TData>) => {
  const isMobile = useIsMobile();
  const showCards = mobileLayout === "cards" && isMobile;

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.meta?.isVisible !== false),
    [columns],
  );

  const sortingState = useMemo(
    () =>
      params.orderBy
        ? [
            {
              desc: params.orderType === "desc",
              id: params.orderBy,
            },
          ]
        : [],
    [params.orderBy, params.orderType],
  );

  const paginationState = useMemo(
    () => ({
      pageIndex: params.page - 1,
      pageSize: params.pageSize,
    }),
    [params.page, params.pageSize],
  );

  const filtersState = useMemo(
    () =>
      Object.keys(params.filters).map((key) => ({
        id: key,
        value: params.filters[key],
      })),
    [params.filters],
  );

  const pageCount = Math.ceil(totalItems / paginationState.pageSize);

  const handlePagination = useCallback(
    (updateFn: Updater<PaginationState>) => {
      const state = functionalUpdate(updateFn, paginationState);
      onParamChange({
        ...params,
        page: state.pageIndex + 1,
        pageSize: state.pageSize,
      });
    },
    [onParamChange, paginationState, params],
  );

  const handleSort = useCallback(
    (updateFn: Updater<SortingState>) => {
      const columnSorts = functionalUpdate(updateFn, sortingState);
      const hasSort = columnSorts.length > 0;

      const orderBy = hasSort ? columnSorts[0].id : "";
      const orderType = hasSort ? (columnSorts[0].desc ? "desc" : "asc") : "";

      onParamChange({
        ...params,
        orderBy,
        orderType,
      });
    },
    [onParamChange, params, sortingState],
  );

  const handleFilterChange = useCallback(
    (updateFn: Updater<ColumnFiltersState>) => {
      const filters = functionalUpdate(updateFn, filtersState);

      onParamChange({
        ...params,
        filters: Object.fromEntries(
          filters.map((filter) => [filter.id, filter.value as string[] | undefined]),
        ),
      });
    },
    [filtersState, onParamChange, params],
  );

  const table = useTable({
    features: dataTableFeatures,
    columns: visibleColumns,
    data,
    pageCount,
    state: {
      sorting: sortingState,
      pagination: paginationState,
      columnFilters: filtersState,
    },
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
    onColumnFiltersChange: handleFilterChange,
    onSortingChange: handleSort,
    onPaginationChange: handlePagination,
    defaultColumn: {
      size: 0,
      minSize: DEFAULT_MIN_COLUMN_WIDTH,
      maxSize: 1000,
    },
  });

  const getRowInteractionProps = useCallback(
    (row: DataTableRow<TData>): BoxProps => ({
      ...(onRowClick && {
        tabIndex: 0,
        cursor: "pointer",
        onClick: (e: React.MouseEvent<HTMLDivElement>) => {
          if (!isNestedControl(e)) onRowClick(row);
        },
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
          if ((e.key !== "Enter" && e.key !== " ") || isNestedControl(e)) return;
          e.preventDefault();
          onRowClick(row);
        },
      }),
      ...getRowProps?.(row),
    }),
    [getRowProps, onRowClick],
  );

  const contextValue = useMemo<DataTableContextValue<TData>>(
    () => ({
      loading: !!loading,
      getRowInteractionProps,
      onReset,
      labels: resolveLabels(labels),
      selections,
    }),
    [getRowInteractionProps, labels, loading, onReset, selections],
  );

  return (
    <DataTableProvider value={contextValue}>
      <Stack
        position="relative"
        bg="bg"
        width="100%"
        flex="1"
        borderWidth={variant === "basic" ? undefined : "1px"}
        borderRadius="sm"
        boxShadow={variant === "basic" ? undefined : "xl"}
        minHeight="0"
      >
        {showCards ? (
          <DataTableCards table={table} />
        ) : (
          <DataTableBody
            table={table}
            showFiltersRow={showFiltersRow}
            renderSubRow={renderSubRow}
          />
        )}

        {showPagination && (
          <DataTablePagination
            table={table}
            totalItems={totalItems}
            size={variant === "basic" ? "xs" : "md"}
          />
        )}
      </Stack>
    </DataTableProvider>
  );
};
