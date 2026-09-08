import {
  type NumberFilterValue,
  parseNumberFilter,
  serializeNumberFilter,
} from "@construkt-kit/utils";
import { useEffect, useMemo } from "react";

import { NumberFilter } from "../../../NumberFilter";
import { FILTER_DEBOUNCE_MS } from "./constants";

interface ColumnNumberFilterProps {
  name: string;
  value: string;
  onChange: (value?: string) => unknown;
}

export const ColumnNumberFilter = ({ name, value, onChange }: ColumnNumberFilterProps) => {
  const parsed = useMemo(() => parseNumberFilter(value), [value]);

  useEffect(() => {
    if (value && !parsed) onChange(undefined);
  }, [value, parsed, onChange]);

  const handleValueChange = (filter: NumberFilterValue | undefined) =>
    onChange(filter ? serializeNumberFilter(filter) : undefined);

  return (
    <NumberFilter
      size="sm"
      variant="plain"
      debounceMs={FILTER_DEBOUNCE_MS}
      placeholder={`Filter ${name}`}
      inputProps={{
        fontWeight: "normal",
        _placeholder: {
          color: "fg.subtle",
        },
      }}
      value={parsed}
      onValueChange={handleValueChange}
    />
  );
};
