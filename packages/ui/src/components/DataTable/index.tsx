import { Box, type BoxProps, Stack } from "@construkt-kit/styled-system/jsx";
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
} from "@tanstack/react-table";
import { useTable } from "@tanstack/react-table";
import React, { useCallback, useMemo } from "react";

import { useIsMobile } from "../../hooks";
import { DataTableBody } from "./Body";
import { DataTableCards } from "./Cards";
import { DataTableProvider, type DataTableContextValue } from "./context";
import { DataTableHeader } from "./Header";
import { DataTablePagination } from "./Pagination";
import type {
  DataTableColumnDef,
  DataTableParams,
  DataTableRow,
  TableFilterSelections,
} from "./types";
import { dataTableFeatures } from "./types";

export type {
  DataTableCell,
  DataTableColumnDef,
  DataTableColumnMeta,
  DataTableFeatures,
  DataTableFilters,
  DataTableHeader as DataTableHeaderType,
  DataTableInstance,
  DataTableParams,
  DataTableRow,
  DataTableSelectProps,
  DataTableSortType,
  DataTableTableMeta,
  TableFilterSelections,
} from "./types";
export { dataTableFeatures } from "./types";

export type DataTableLabels = {
  noResults?: string;
  resetFilters?: string;
  items?: string;
  page?: string;
  outOf?: string;
};

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

const isNestedControl = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  !!(target.closest("[data-scope=menu]") || target.closest("button") || target.closest("a"));

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
      const state = typeof updateFn === "function" ? updateFn(paginationState) : updateFn;
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
      const columnSorts = typeof updateFn === "function" ? updateFn(sortingState) : updateFn;
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
      const filters = typeof updateFn === "function" ? updateFn(filtersState) : updateFn;

      const filtersById = filters.reduce(
        (obj, curr) => ({
          ...obj,
          [curr.id]: curr.value,
        }),
        {},
      );

      onParamChange({
        ...params,
        filters: filtersById,
      });
    },
    [filtersState, onParamChange, params],
  );

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    pageCount,
    state: {
      sorting: sortingState,
      pagination: paginationState,
      columnFilters: filtersState,
    },
    meta: {
      selections,
    },
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
    onColumnFiltersChange: handleFilterChange,
    onSortingChange: handleSort,
    onPaginationChange: handlePagination,
    defaultColumn: {
      size: 0,
      minSize: 0,
      maxSize: 1000,
    },
  });

  const handleRowClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, row: DataTableRow<TData>) => {
      if (!onRowClick || isNestedControl(e.target)) return;
      onRowClick(row);
    },
    [onRowClick],
  );

  const handleRowKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, row: DataTableRow<TData>) => {
      if (!onRowClick || (e.key !== "Enter" && e.key !== " ")) return;
      if (isNestedControl(e.target)) return;
      e.preventDefault();
      onRowClick(row);
    },
    [onRowClick],
  );

  const contextValue = useMemo<DataTableContextValue<TData>>(
    () => ({
      loading: !!loading,
      onRowClick: onRowClick && handleRowClick,
      onRowKeyDown: onRowClick && handleRowKeyDown,
      getRowProps,
      onReset,
      noResultsLabel: labels?.noResults ?? "No results available.",
      resetFiltersLabel: labels?.resetFilters ?? "Reset filters",
    }),
    [getRowProps, handleRowClick, handleRowKeyDown, labels, loading, onReset, onRowClick],
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
          <Box
            display="flex"
            flexDirection="column"
            flex="1"
            minHeight="0"
          >
            <DataTableHeader
              table={table}
              showFiltersRow={showFiltersRow}
            />
            <DataTableBody
              table={table}
              renderSubRow={renderSubRow}
            />
          </Box>
        )}

        {showPagination && (
          <DataTablePagination
            table={table}
            totalItems={totalItems}
            size={variant === "basic" ? "xs" : "md"}
            labels={labels}
          />
        )}
      </Stack>
    </DataTableProvider>
  );
};
