import {
  type NumberFilterValue,
  parseNumberFilter,
  serializeNumberFilter,
} from "@construkt-kit/utils";
import { useMemo } from "react";

import { NumberFilter } from "../../../NumberFilter";
import { useDataTableContext } from "../../context";
import type { ColumnFilterProps } from "../../types";

export const ColumnNumberFilter = ({
  placeholder,
  value,
  onChange,
  size,
  variant,
  debounceMs,
}: ColumnFilterProps) => {
  const { labels } = useDataTableContext();
  const current = value[0] ?? "";
  const parsed = useMemo(() => parseNumberFilter(current), [current]);

  const handleValueChange = (filter: NumberFilterValue | undefined) =>
    onChange(filter ? [serializeNumberFilter(filter)] : undefined);

  return (
    <NumberFilter
      size={size}
      variant={variant}
      debounceMs={debounceMs}
      placeholder={placeholder}
      clearLabel={labels.clearNumber}
      fromLabel={labels.numberFrom}
      toLabel={labels.numberTo}
      operatorLabels={labels.numberOperators}
      value={parsed}
      onValueChange={handleValueChange}
    />
  );
};
