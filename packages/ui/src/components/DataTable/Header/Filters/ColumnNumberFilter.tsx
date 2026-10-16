import {
  type NumberFilterValue,
  parseNumberFilter,
  serializeNumberFilter,
} from "@construkt-kit/utils";
import { useEffect, useMemo } from "react";

import { NumberFilter } from "../../../NumberFilter";
import { useDataTableContext } from "../../context";
import type { ColumnFilterProps } from "../../types";

export const ColumnNumberFilter = ({
  placeholder,
  value,
  onChange,
  layout,
  debounceMs,
}: ColumnFilterProps) => {
  const { labels } = useDataTableContext();
  const current = value[0] ?? "";
  const parsed = useMemo(() => parseNumberFilter(current), [current]);

  useEffect(() => {
    if (current && !parsed) onChange(undefined);
  }, [current, parsed, onChange]);

  const handleValueChange = (filter: NumberFilterValue | undefined) =>
    onChange(filter ? [serializeNumberFilter(filter)] : undefined);

  return (
    <NumberFilter
      size={layout === "field" ? "md" : "sm"}
      variant={layout === "field" ? "outline" : "plain"}
      debounceMs={debounceMs}
      placeholder={placeholder}
      clearLabel={labels.clearNumber}
      value={parsed}
      onValueChange={handleValueChange}
    />
  );
};
