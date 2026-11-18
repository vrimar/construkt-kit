import { useMemo } from "react";

import { columnMeta, facetOptions, filterValues } from "../../columns";
import { useDataTableContext } from "../../context";
import type { ColumnFilterLayout, DataTableHeader } from "../../types";
import { getColumnLabel } from "../columnLabel";
import { FILTER_DEBOUNCE_MS } from "./constants";
import { filterKinds } from "./filterKinds";

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
  const { labels, clientSide, selections } = useDataTableContext();
  const column = header.column;
  const meta = columnMeta(column);
  const { Control } = filterKinds[meta.type];
  const isSelect = meta.type === "select";
  const selection = selections?.[column.id];
  const facets = isSelect && clientSide && !selection ? column.getFacetedUniqueValues() : undefined;
  const options = useMemo(
    () => (!isSelect ? undefined : facets ? facetOptions(facets) : [...new Set(selection)]),
    [isSelect, facets, selection],
  );

  return (
    <Control
      placeholder={filterPlaceholder(labels.filterBy, header)}
      meta={meta}
      value={filterValues(draft ? draft.value : column.getFilterValue())}
      onChange={draft?.onChange ?? ((value) => column.setFilterValue(value))}
      layout={layout}
      debounceMs={draft ? 0 : FILTER_DEBOUNCE_MS}
      options={options}
    />
  );
};
