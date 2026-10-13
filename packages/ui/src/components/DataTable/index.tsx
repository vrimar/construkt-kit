import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
} from "@tanstack/react-table";
import { functionalUpdate, useTable } from "@tanstack/react-table";
import React, { useCallback, useEffect, useMemo } from "react";

import { Stack } from "#styled-system/jsx";
import type { JsxStyleProps } from "#styled-system/types";

import { useIsMobile } from "../../hooks";
import { useLatestRef } from "../../hooks/useLatestRef";
import { DataTableBody } from "./Body";
import { DataTableCards } from "./Cards";
import { DataTableProvider, type DataTableContextValue } from "./context";
import { DataTablePagination } from "./Pagination";
import type {
  DataTableColumnDef,
  DataTableFilters,
  DataTableLabels,
  DataTableParams,
  DataTableRow,
  DataTableRowProps,
  TableFilterSelections,
} from "./types";
import { dataTableFeatures } from "./types";

export type {
  ColumnFilterType,
  DataTableColumnAlign,
  DataTableColumnDef,
  DataTableColumnMeta,
  DataTableFeatures,
  DataTableFilters,
  DataTableLabels,
  DataTableParams,
  DataTableRow,
  DataTableRowProps,
  DataTableSelectProps,
  DataTableSortType,
  TableFilterSelections,
} from "./types";
export { createDataTableColumnHelper } from "./types";

export type DataTableProps<TData extends object> = JsxStyleProps & {
  data: TData[];
  totalItems: number;
  columnDefs: DataTableColumnDef<TData, any>[];
  loading?: boolean;
  params: DataTableParams;
  onParamChange: (params: DataTableParams) => unknown;
  onRowClick?: (row: DataTableRow<TData>) => unknown;
  onReset?: () => unknown;
  getRowProps?: (row: DataTableRow<TData>) => DataTableRowProps;
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
  sortBy: "Sort by",
  clearSearch: "Clear search",
  clearNumber: "Clear filter",
  clearDate: "Clear date",
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

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  "[contenteditable]:not([contenteditable='false'])",
  "[role=button]",
  "[role=checkbox]",
  "[role=combobox]",
  "[role=link]",
  "[role=radio]",
  "[role=slider]",
  "[role=spinbutton]",
  "[role=switch]",
  "[role=tab]",
  "[role=textbox]",
].join(", ");

const isSameFilterValue = (a: string[] = [], b: string[] = []) =>
  a.length === b.length && a.every((item, index) => item === b[index]);

const isSameFilters = (a: DataTableFilters, b: DataTableFilters) =>
  [...Object.keys(a), ...Object.keys(b)].every((key) => isSameFilterValue(a[key], b[key]));

// Portalled overlays re-dispatch React events through the row without being inside it.
const isNestedControl = ({ currentTarget, target }: React.SyntheticEvent<HTMLDivElement>) => {
  if (!(target instanceof Element && currentTarget.contains(target))) return true;
  const control = target.closest(INTERACTIVE_SELECTOR);
  return !!control && control !== currentTarget && currentTarget.contains(control);
};

export const DataTable = <TData extends object>({
  data,
  params,
  onParamChange,
  columnDefs,
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
  ...styleProps
}: DataTableProps<TData>) => {
  const isMobile = useIsMobile();
  const showCards = mobileLayout === "cards" && isMobile;

  const visibleColumns = useMemo(
    () => columnDefs.filter((column) => column.meta?.isVisible !== false),
    [columnDefs],
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

  const latestRef = useLatestRef({ params, onParamChange });

  useEffect(() => {
    let page = params.page;
    if (!(page >= 1)) page = 1;
    else if (!loading && pageCount > 0 && page > pageCount) page = pageCount;
    if (page !== params.page) {
      latestRef.current.onParamChange({ ...latestRef.current.params, page });
    }
  }, [latestRef, loading, pageCount, params.page]);

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
        page: 1,
        orderBy,
        orderType,
      });
    },
    [onParamChange, params, sortingState],
  );

  const handleFilterChange = useCallback(
    (updateFn: Updater<ColumnFiltersState>) => {
      const filters: DataTableFilters = Object.fromEntries(
        functionalUpdate(updateFn, filtersState).map((filter) => [
          filter.id,
          filter.value as string[] | undefined,
        ]),
      );
      if (isSameFilters(filters, params.filters)) return;

      onParamChange({
        ...params,
        page: 1,
        filters,
      });
    },
    [filtersState, onParamChange, params],
  );

  const table = useTable({
    features: dataTableFeatures,
    columns: visibleColumns,
    data,
    getRowCanExpand: renderSubRow ? () => true : undefined,
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
  });

  const getRowInteractionProps = useCallback(
    (row: DataTableRow<TData>): DataTableRowProps => ({
      ...(onRowClick && {
        "data-clickable": true,
        tabIndex: 0,
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
        {...styleProps}
      >
        {showCards ? (
          <DataTableCards
            table={table}
            renderSubRow={renderSubRow}
          />
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
