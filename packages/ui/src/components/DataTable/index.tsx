import { Box, type BoxProps, Stack } from "@construkt-kit/styled-system/jsx";
import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
} from "@tanstack/react-table";
import { useTable } from "@tanstack/react-table";
import React, { useMemo } from "react";

import { useIsMobile } from "../../hooks";
import { DataTableBody } from "./Body";
import { DataTableCards } from "./Cards";
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
      params?.orderBy
        ? [
            {
              desc: params.orderType === "desc",
              id: params.orderBy,
            },
          ]
        : [],
    [params],
  );

  const paginationState = useMemo(
    () => ({
      pageIndex: params.page - 1,
      pageSize: params.pageSize,
    }),
    [params],
  );

  const filtersState = useMemo(
    () =>
      Object.keys(params.filters).map((key) => ({
        id: key,
        value: params.filters[key],
      })),
    [params],
  );

  const pageCount = Math.ceil(totalItems / paginationState.pageSize);

  const handlePagination = (updateFn: Updater<PaginationState>) => {
    const state = typeof updateFn === "function" ? updateFn(paginationState) : updateFn;
    onParamChange({
      ...params,
      page: state.pageIndex + 1,
      pageSize: state.pageSize,
    });
  };

  const handleSort = (updateFn: Updater<SortingState>) => {
    const columnSorts = typeof updateFn === "function" ? updateFn(sortingState) : updateFn;
    const hasSort = columnSorts.length > 0;

    const orderBy = hasSort ? columnSorts[0].id : "";
    const orderType = hasSort ? (columnSorts[0].desc ? "desc" : "asc") : "";

    onParamChange({
      ...params,
      orderBy,
      orderType,
    });
  };

  const handleFilterChange = (updateFn: Updater<ColumnFiltersState>) => {
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
  };

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

  const handleRowClick = (e: React.MouseEvent<HTMLDivElement>, row: DataTableRow<TData>) => {
    if (!onRowClick) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-scope=menu]") || target.closest("button") || target.closest("a"))
      return;
    onRowClick(row);
  };

  return (
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
        <DataTableCards
          loading={!!loading}
          table={table}
          onRowClick={handleRowClick}
          getRowProps={getRowProps}
          onReset={onReset}
          labels={labels}
        />
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
            loading={!!loading}
            table={table}
            onRowClick={handleRowClick}
            getRowProps={getRowProps}
            renderSubRow={renderSubRow}
            onReset={onReset}
            labels={labels}
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
  );
};
