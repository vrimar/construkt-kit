import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
  Updater,
} from "@tanstack/react-table";
import { functionalUpdate, useTable } from "@tanstack/react-table";
import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { Stack } from "#styled-system/jsx";
import type { JsxStyleProps } from "#styled-system/types";

import { useIsMobile } from "../../hooks";
import { useControllableState } from "../../hooks/useControllableState";
import { useLatestRef } from "../../hooks/useLatestRef";
import { DataTableBody } from "./Body";
import { DataTableCards } from "./Cards";
import { columnMeta, filterValues, listedColumns } from "./columns";
import { DataTableProvider, type DataTableContextValue } from "./context";
import { filterKinds } from "./Header/Filters/filterKinds";
import { resolveLabels } from "./labels";
import { DataTablePagination } from "./Pagination";
import { withColumnDefaults } from "./rowModelFns";
import type {
  DataTableColumn,
  DataTableColumnDef,
  DataTableColumnSizing,
  DataTableColumnVisibility,
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
  DataTableColumnSizing,
  DataTableColumnVisibility,
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
export { DataTableColumnPicker, type DataTableColumnPickerProps } from "./ColumnPicker";

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
  /** Replaces the "no results" block, for an empty state with its own icon or actions. */
  emptyState?: React.ReactNode;
  /**
   * How the table adapts below the `md` breakpoint.
   * - `"scroll"` (default): keep the grid layout.
   * - `"cards"`: render each row as a card laid out by the columns' `meta.card` roles, with a
   *   search box, sort chip and filters drawer in place of the header rows.
   */
  mobileLayout?: "scroll" | "cards";
  /**
   * Lets the user drag the end edge of a column header to resize the column, and double-click
   * the edge to reset it. A column with `meta.resizable: false` keeps its width.
   */
  enableColumnResizing?: boolean;
  /**
   * Column widths from resizing, in px by column id, over `meta.width`. Leave out to keep them in
   * the table; pass with `onColumnSizingChange` to own them, such as to persist them.
   */
  columnSizing?: DataTableColumnSizing;
  /** Called when a resize ends or a column is reset, with the width of every resized column. */
  onColumnSizingChange?: (columnSizing: DataTableColumnSizing) => unknown;
  /**
   * Hides the columns set to `false`, such as from a `DataTableColumnPicker`. A hidden column's
   * sort and filter params still apply. A column with `meta.isVisible: false` never shows.
   */
  columnVisibility?: DataTableColumnVisibility;
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

const NO_HIDDEN_COLUMNS: DataTableColumnVisibility = {};
const NO_COLUMN_SIZING: DataTableColumnSizing = {};

const withoutKey = <V,>(record: Record<string, V>, key: string) =>
  Object.fromEntries(Object.entries(record).filter(([entryKey]) => entryKey !== key));

const isSameFilterValue = (a: string[] = [], b: string[] = []) =>
  a.length === b.length && a.every((item, index) => item === b[index]);

const isSameFilters = (a: DataTableFilters, b: DataTableFilters) =>
  [...Object.keys(a), ...Object.keys(b)].every((key) => isSameFilterValue(a[key], b[key]));

const withoutMalformedFilters = <TData extends object>(
  filters: DataTableFilters,
  columns: DataTableColumn<TData, any>[],
) =>
  columns
    .filter((column) => {
      const { parse } = filterKinds[columnMeta(column).type];
      return filterValues(filters[column.id]).some((raw) => parse(raw) === undefined);
    })
    .reduce((rest, column) => withoutKey(rest, column.id), filters);

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
  emptyState,
  mobileLayout = "scroll",
  enableColumnResizing = false,
  columnSizing,
  onColumnSizingChange,
  columnVisibility = NO_HIDDEN_COLUMNS,
  ...styleProps
}: DataTableProps<TData>) => {
  const isMobile = useIsMobile();
  const showCards = mobileLayout === "cards" && isMobile;
  const gridRef = useRef<HTMLDivElement>(null);

  const [resolvedColumnSizing, setColumnSizing] = useControllableState({
    value: columnSizing,
    defaultValue: NO_COLUMN_SIZING,
    onChange: onColumnSizingChange,
  });
  const sizingRef = useLatestRef(resolvedColumnSizing);

  const resizeColumn = useCallback(
    (columnId: string, width: number | undefined) => {
      const current = sizingRef.current;
      if (width === undefined ? !(columnId in current) : current[columnId] === width) return;
      setColumnSizing(
        width === undefined ? withoutKey(current, columnId) : { ...current, [columnId]: width },
      );
    },
    [sizingRef, setColumnSizing],
  );

  const columns = useMemo(() => withColumnDefaults(listedColumns(columnDefs)), [columnDefs]);

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

  const latestRef = useLatestRef({
    params,
    onParamChange,
    sortingState,
    paginationState,
    filtersState,
  });

  const handlePagination = useCallback(
    (updateFn: Updater<PaginationState>) => {
      const latest = latestRef.current;
      const state = functionalUpdate(updateFn, latest.paginationState);
      latest.onParamChange({
        ...latest.params,
        page: state.pageIndex + 1,
        pageSize: state.pageSize,
      });
    },
    [latestRef],
  );

  const handleSort = useCallback(
    (updateFn: Updater<SortingState>) => {
      const latest = latestRef.current;
      const columnSorts = functionalUpdate(updateFn, latest.sortingState);
      const hasSort = columnSorts.length > 0;

      const orderBy = hasSort ? columnSorts[0].id : "";
      const orderType = hasSort ? (columnSorts[0].desc ? "desc" : "asc") : "";
      if (orderBy === latest.params.orderBy && orderType === latest.params.orderType) return;

      latest.onParamChange({
        ...latest.params,
        page: 1,
        orderBy,
        orderType,
      });
    },
    [latestRef],
  );

  const handleFilterChange = useCallback(
    (updateFn: Updater<ColumnFiltersState>) => {
      const latest = latestRef.current;
      const filters: DataTableFilters = Object.fromEntries(
        functionalUpdate(updateFn, latest.filtersState).map((filter) => [
          filter.id,
          filter.value as string[] | undefined,
        ]),
      );
      if (isSameFilters(filters, latest.params.filters)) return;

      latest.onParamChange({
        ...latest.params,
        page: 1,
        filters,
      });
    },
    [latestRef],
  );

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    getRowCanExpand: renderSubRow ? () => true : undefined,
    rowCount: clientSide ? undefined : totalItems,
    state: {
      sorting: sortingState,
      pagination: paginationState,
      columnFilters: filtersState,
      columnVisibility,
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
  const leafColumns = table.getAllLeafColumns();
  // By value, so a parent passing equal but fresh filters doesn't re-run the effect.
  const filtersKey = JSON.stringify(params.filters);

  useEffect(() => {
    const latest = latestRef.current;
    const filters = withoutMalformedFilters(latest.params.filters, leafColumns);
    let page = filters === latest.params.filters ? latest.params.page : 1;
    if (!(page >= 1)) page = 1;
    else if (!loading && pageCount > 0 && page > pageCount) page = pageCount;
    if (page !== latest.params.page || filters !== latest.params.filters) {
      latest.onParamChange({ ...latest.params, page, filters });
    }
  }, [latestRef, leafColumns, loading, pageCount, params.page, filtersKey]);

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
      columnSizing: resolvedColumnSizing,
      resizeColumn: enableColumnResizing ? resizeColumn : undefined,
      gridRef,
    }),
    [
      clientSide,
      enableColumnResizing,
      getRowInteractionProps,
      labels,
      loading,
      onReset,
      resizeColumn,
      resolvedColumnSizing,
      selections,
    ],
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
            emptyState={emptyState}
          />
        ) : (
          <DataTableBody
            table={table}
            showFiltersRow={showFiltersRow}
            renderSubRow={renderSubRow}
            emptyState={emptyState}
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
