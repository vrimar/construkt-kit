import {
  type NumberFilterValue,
  parseNumberFilter,
  serializeNumberFilter,
} from "@construkt-kit/utils";
import { useEffect, useMemo } from "react";

import { NumberFilter } from "../../../NumberFilter";
import { useDataTableContext } from "../../context";
import type { ColumnFilterProps } from "../../types";
import { FILTER_DEBOUNCE_MS } from "./constants";

export const ColumnNumberFilter = ({ label, value, onChange }: ColumnFilterProps) => {
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
      size="sm"
      variant="plain"
      debounceMs={FILTER_DEBOUNCE_MS}
      placeholder={`${labels.filterBy} ${label}`}
      value={parsed}
      onValueChange={handleValueChange}
    />
  );
};
