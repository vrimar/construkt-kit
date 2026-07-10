import { useMemo } from "react";

import { ApplySelect } from "../../../ApplySelect";
import type { ColumnFilterValue, DataTableSelectProps } from "../../types";

interface ColumnSelectFilterProps {
  name: string;
  filterValues: string[];
  value: string[];
  selectProps?: DataTableSelectProps;
  onValueChange: (value: ColumnFilterValue) => unknown;
}

export const ColumnSelectFilter = ({
  name,
  filterValues,
  value,
  selectProps,
  onValueChange,
}: ColumnSelectFilterProps) => {
  const getLabel = useMemo(
    () => selectProps?.getItemLabel ?? ((item: string) => item),
    [selectProps?.getItemLabel],
  );

  const triggerLabel = useMemo(() => {
    if (value.length === 0) return `Filter by ${name}`;
    if (value.length === 1) return getLabel(value[0]);
    return `${value.length} selected`;
  }, [value, name, getLabel]);

  const { getItemLabel: _getItemLabel, triggerProps, ...applySelectProps } = selectProps ?? {};

  return (
    <ApplySelect
      {...applySelectProps}
      items={filterValues}
      value={value}
      getItemLabel={getLabel}
      getItemValue={(item) => item}
      onValueChange={(values) => onValueChange(values.length === 0 ? undefined : values)}
      placement="bottom-end"
      triggerProps={{
        ...triggerProps,
        buttonProps: {
          label: triggerLabel,
          size: "sm",
          width: "100%",
          variant: "plain",
          ...triggerProps?.buttonProps,
        },
      }}
    />
  );
};
