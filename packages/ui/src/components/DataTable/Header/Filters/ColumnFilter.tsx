import type { ComponentType } from "react";

import { columnMeta, filterValues } from "../../columns";
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

const filterControls: Record<ColumnFilterType, ComponentType<ColumnFilterProps>> = {
  input: ColumnSearchInput,
  select: ColumnSelectFilter,
  date: ColumnDateFilter,
  number: ColumnNumberFilter,
};

const filterLooks = {
  cell: { size: "sm", variant: "plain" },
  field: { size: "md", variant: "outline" },
} as const satisfies Record<ColumnFilterLayout, Pick<ColumnFilterProps, "size" | "variant">>;

export const filterPlaceholder = <TData extends object>(
  filterBy: string,
  header: DataTableHeader<TData>,
) => `${filterBy} ${getColumnLabel(header)}`;

interface ColumnFilterDraft {
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
  const { labels } = useDataTableContext();
  const column = header.column;
  const Control = filterControls[columnMeta(column).type];

  return (
    <Control
      column={column}
      placeholder={filterPlaceholder(labels.filterBy, header)}
      value={filterValues(draft ? draft.value : column.getFilterValue())}
      onChange={draft?.onChange ?? ((value) => column.setFilterValue(value))}
      layout={layout}
      size={filterLooks[layout].size}
      variant={filterLooks[layout].variant}
      debounceMs={draft ? 0 : FILTER_DEBOUNCE_MS}
    />
  );
};
