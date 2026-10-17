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
import { withColumnDefaults } from "./rowModelFns";
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
  DataTableCardRole,
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
   * - `"cards"`: render each row as a card laid out by the columns' `meta.card` roles, with a
   *   search box, sort chip and filters drawer in place of the header rows.
   */
  mobileLayout?: "scroll" | "cards";
} & (
    | { totalItems: number; clientSide?: false }
    | {
        /**
         * Filter, sort and page `data` in the table by `params`, from each column's
         * `meta.type`, instead of rendering it as given. A select filter without
         * `selections` lists the column's values across every row.
         */
        clientSide: true;
        totalItems?: never;
      }
  );

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
  sort: "Sort",
  filters: "Filters",
  ascending: "Ascending",
  descending: "Descending",
  clearSort: "Clear",
  done: "Done",
  removeFilter: "Remove filter",
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
  clientSide = false,
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
    () => withColumnDefaults(columnDefs.filter((column) => column.meta?.isVisible !== false)),
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

  const latestRef = useLatestRef({ params, onParamChange });

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
      if (orderBy === params.orderBy && orderType === params.orderType) return;

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
    rowCount: clientSide ? undefined : totalItems,
    state: {
      sorting: sortingState,
      pagination: paginationState,
      columnFilters: filtersState,
    },
    manualSorting: !clientSide,
    manualPagination: !clientSide,
    manualFiltering: !clientSide,
    autoResetPageIndex: false,
    onColumnFiltersChange: handleFilterChange,
    onSortingChange: handleSort,
    onPaginationChange: handlePagination,
  });

  const pageCount = table.getPageCount();

  useEffect(() => {
    let page = params.page;
    if (!(page >= 1)) page = 1;
    else if (!loading && pageCount > 0 && page > pageCount) page = pageCount;
    if (page !== params.page) {
      latestRef.current.onParamChange({ ...latestRef.current.params, page });
    }
  }, [latestRef, loading, pageCount, params.page]);

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
      clientSide,
    }),
    [clientSide, getRowInteractionProps, labels, loading, onReset, selections],
  );

  return (
    <DataTableProvider value={contextValue}>
      <Stack
        position="relative"
        bg="bg"
        width="100%"
        flex="1"
        borderWidth={variant === "basic" || showCards ? undefined : "1px"}
        borderRadius="sm"
        boxShadow={variant === "basic" || showCards ? undefined : "xl"}
        minHeight="0"
        {...styleProps}
      >
        {showCards ? (
          <DataTableCards
            table={table}
            showFilters={showFiltersRow}
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
            size={variant === "basic" ? "xs" : "md"}
            compact={showCards}
          />
        )}
      </Stack>
    </DataTableProvider>
  );
};
