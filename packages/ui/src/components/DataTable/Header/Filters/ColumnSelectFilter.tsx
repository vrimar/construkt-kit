import { useMemo } from "react";

import { ApplySelect } from "../../../Select";
import { useDataTableContext } from "../../context";
import { facetOptions } from "../../rowModelFns";
import type { ColumnFilterProps } from "../../types";

export const ColumnSelectFilter = ({
  columnId,
  placeholder,
  meta,
  value,
  onChange,
  layout,
  facetedValues,
}: ColumnFilterProps) => {
  const { selections } = useDataTableContext();
  const selectProps = meta?.selectProps;

  const items = useMemo(
    () => (facetedValues ? facetOptions(facetedValues) : [...new Set(selections?.[columnId])]),
    [selections, columnId, facetedValues],
  );

  const getLabel = useMemo(
    () => selectProps?.getItemLabel ?? ((item: string) => item),
    [selectProps?.getItemLabel],
  );

  const {
    actions,
    getItemLabel: _getItemLabel,
    triggerProps,
    ...applySelectProps
  } = selectProps ?? {};

  return (
    <ApplySelect
      placement={layout === "field" ? "bottom-start" : "bottom-end"}
      placeholder={placeholder}
      {...applySelectProps}
      items={items}
      value={value}
      getItemLabel={getLabel}
      getItemValue={(item) => item}
      onValueChange={(values) => onChange(values.length === 0 ? undefined : values)}
      actions={{ reset: true, ...actions }}
      triggerProps={{
        ...triggerProps,
        buttonProps: {
          size: layout === "field" ? "md" : "sm",
          variant: layout === "field" ? "surface" : "plain",
          ...triggerProps?.buttonProps,
        },
      }}
    />
  );
};
