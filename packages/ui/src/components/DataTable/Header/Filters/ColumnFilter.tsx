import type { ComponentType } from "react";

import { useDataTableContext } from "../../context";
import type {
  ColumnFilterLayout,
  ColumnFilterProps,
  ColumnFilterType,
  DataTableHeader,
} from "../../types";
import { getColumnLabel } from "../columnLabel";
import { ColumnDateFilter } from "./ColumnDateFilter";
import { ColumnNumberFilter } from "./ColumnNumberFilter";
import { ColumnSearchInput } from "./ColumnSearchInput";
import { ColumnSelectFilter } from "./ColumnSelectFilter";
import { FILTER_DEBOUNCE_MS } from "./constants";

const columnFilters: Record<ColumnFilterType, ComponentType<ColumnFilterProps>> = {
  input: ColumnSearchInput,
  date: ColumnDateFilter,
  number: ColumnNumberFilter,
  select: ColumnSelectFilter,
};

export interface ColumnFilterDraft {
  value: string[] | undefined;
  onChange: (value: string[] | undefined) => void;
}

interface ColumnFilterControlProps<TData extends object> {
  header: DataTableHeader<TData>;
  layout: ColumnFilterLayout;
  draft?: ColumnFilterDraft;
}

export const ColumnFilter = <TData extends object>({
  header,
  layout,
  draft,
}: ColumnFilterControlProps<TData>) => {
  const { labels, clientSide, selections } = useDataTableContext();
  const column = header.column;
  const { meta } = column.columnDef;
  const type = meta?.type ?? "input";
  const Filter = columnFilters[type];
  const filterValue = draft ? draft.value : column.getFilterValue();
  const faceted = clientSide && type === "select" && !selections?.[column.id];

  return (
    <Filter
      columnId={column.id}
      placeholder={`${labels.filterBy} ${getColumnLabel(header)}`}
      meta={meta}
      value={Array.isArray(filterValue) ? (filterValue as string[]) : []}
      onChange={draft?.onChange ?? ((value) => column.setFilterValue(value))}
      layout={layout}
      debounceMs={draft ? 0 : FILTER_DEBOUNCE_MS}
      facetedValues={faceted ? column.getFacetedUniqueValues() : undefined}
    />
  );
};
