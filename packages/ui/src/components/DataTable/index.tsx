import { Box, type BoxProps, Stack } from "@construkt-kit/styled-system/jsx";
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Row,
  SortingState,
  Updater,
} from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import React, { useMemo } from "react";

import { DataTableBody } from "./Body";
import { DataTableHeader } from "./Header";
import { DataTablePagination } from "./Pagination";
import type { DataTableParams, TableFilterSelections } from "./types";

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
  columns: ColumnDef<TData, string>[];
  loading?: boolean;
  params: DataTableParams;
  onParamChange: (params: DataTableParams) => unknown;
  onRowClick?: (row: Row<TData>) => unknown;
  onReset?: () => unknown;
  getRowProps?: (row: Row<TData>) => BoxProps;
  renderSubRow?: (row: Row<TData>) => React.ReactNode;
  selections?: TableFilterSelections;
  showPagination?: boolean;
  showFiltersRow?: boolean;
  variant?: "default" | "basic";
  labels?: DataTableLabels;
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
}: DataTableProps<TData>) => {
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

  const table = useReactTable({
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
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      size: 0,
      minSize: 0,
      maxSize: 1000,
    },
  });

  const handleRowClick = (e: React.MouseEvent<HTMLDivElement>, row: Row<TData>) => {
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
