import { useMemo } from "react";

import { ApplySelect } from "../../../Select";
import { columnMeta, facetOptions, selectItemLabel } from "../../columns";
import { useDataTableContext } from "../../context";
import type { ColumnFilterProps } from "../../types";

export const ColumnSelectFilter = ({
  column,
  placeholder,
  value,
  onChange,
  layout,
  size,
  variant,
}: ColumnFilterProps) => {
  const { clientSide, selections } = useDataTableContext();
  const meta = columnMeta(column);
  const selection = selections?.[column.id];
  const facets = clientSide && !selection ? column.getFacetedUniqueValues() : undefined;
  const options = useMemo(
    () => (facets ? facetOptions(facets) : [...new Set(selection)]),
    [facets, selection],
  );
  const {
    actions,
    getItemLabel: _getItemLabel,
    triggerProps,
    ...applySelectProps
  } = meta.selectProps ?? {};

  return (
    <ApplySelect
      placement={layout === "field" ? "bottom-start" : "bottom-end"}
      placeholder={placeholder}
      {...applySelectProps}
      items={options}
      value={value}
      getItemLabel={selectItemLabel(meta)}
      getItemValue={(item) => item}
      onValueChange={(values) => onChange(values.length === 0 ? undefined : values)}
      actions={{ reset: true, ...actions }}
      triggerProps={{
        ...triggerProps,
        buttonProps: { size, variant, ...triggerProps?.buttonProps },
      }}
    />
  );
};
