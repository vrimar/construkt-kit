import { useMemo } from "react";

import { ApplySelect } from "../../../ApplySelect";
import type { ColumnFilterValue, DataTableSelectProps } from "../../types";

interface ColumnSelectFilterProps {
  name: string;
  filterValues: string[];
  selected: string[];
  selectProps?: DataTableSelectProps;
  onApply: (value: ColumnFilterValue) => unknown;
}

export const ColumnSelectFilter = ({
  name,
  filterValues,
  selected,
  selectProps,
  onApply,
}: ColumnSelectFilterProps) => {
  const triggerLabel = useMemo(() => {
    if (!selected || selected.length === 0) return `Filter by ${name}`;
    if (selected.length === 1) return selected[0];
    return `${selected.length} selected`;
  }, [selected, name]);

  return (
    <ApplySelect.Root
      items={filterValues}
      selected={selected}
      getLabel={(item) => item}
      getValue={(item) => item}
      onApply={onApply}
      placement="bottom-end"
      {...selectProps?.root}
    >
      <ApplySelect.Trigger
        label={triggerLabel}
        size="sm"
        width="100%"
        variant="plain"
        {...selectProps?.trigger}
      />
      <ApplySelect.Content {...selectProps?.content}>
        <ApplySelect.Search {...selectProps?.search} />
        <ApplySelect.List {...selectProps?.list}>
          <ApplySelect.Items>
            {(item: string) => (
              <ApplySelect.Item
                key={item}
                item={item}
              >
                <ApplySelect.ItemText />
                <ApplySelect.ItemIndicator />
              </ApplySelect.Item>
            )}
          </ApplySelect.Items>
          <ApplySelect.EmptyState />
        </ApplySelect.List>
        <ApplySelect.Actions
          cancelText="Reset"
          onReset={() => onApply(undefined)}
          {...selectProps?.actions}
        />
      </ApplySelect.Content>
    </ApplySelect.Root>
  );
};
