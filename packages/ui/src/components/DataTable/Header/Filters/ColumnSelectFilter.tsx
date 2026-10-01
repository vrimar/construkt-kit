import { useMemo } from "react";

import { ApplySelect } from "../../../ApplySelect";
import { useDataTableContext } from "../../context";
import type { ColumnFilterProps } from "../../types";

export const ColumnSelectFilter = ({
  columnId,
  label,
  meta,
  value,
  onChange,
}: ColumnFilterProps) => {
  const { labels, selections } = useDataTableContext();
  const selectProps = meta?.selectProps;

  const getLabel = useMemo(
    () => selectProps?.getItemLabel ?? ((item: string) => item),
    [selectProps?.getItemLabel],
  );

  const triggerLabel = useMemo(() => {
    if (value.length === 0) return `${labels.filterBy} ${label}`;
    if (value.length === 1) return getLabel(value[0]);
    return `${value.length} selected`;
  }, [value, labels.filterBy, label, getLabel]);

  const {
    actions,
    getItemLabel: _getItemLabel,
    triggerProps,
    ...applySelectProps
  } = selectProps ?? {};

  return (
    <ApplySelect
      placement="bottom-end"
      {...applySelectProps}
      items={selections?.[columnId] ?? []}
      value={value}
      getItemLabel={getLabel}
      getItemValue={(item) => item}
      onValueChange={(values) => onChange(values.length === 0 ? undefined : values)}
      actions={{ reset: true, ...actions }}
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
