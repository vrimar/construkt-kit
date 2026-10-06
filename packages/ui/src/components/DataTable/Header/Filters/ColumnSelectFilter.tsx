import { useMemo } from "react";

import { ApplySelect } from "../../../Select";
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

  const {
    actions,
    getItemLabel: _getItemLabel,
    triggerProps,
    ...applySelectProps
  } = selectProps ?? {};

  return (
    <ApplySelect
      placement="bottom-end"
      placeholder={`${labels.filterBy} ${label}`}
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
          size: "sm",
          variant: "plain",
          ...triggerProps?.buttonProps,
        },
      }}
    />
  );
};
