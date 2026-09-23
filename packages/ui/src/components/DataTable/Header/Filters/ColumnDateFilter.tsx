import { Box } from "@construkt-kit/styled-system/jsx";
import {
  formatIsoDate,
  parseDateRangeFilter,
  serializeDateRangeFilter,
} from "@construkt-kit/utils";
import { useState } from "react";

import { useControlledMirror } from "../../../../hooks/useControlledMirror";
import { DatePickerSelect, type DateValue, parseDate } from "../../../DatePicker";
import type { ColumnFilterProps } from "../../types";

function parseDateValue(dateValue: string | undefined): DateValue[] {
  const range = dateValue ? parseDateRangeFilter(dateValue) : undefined;
  return range ? range.map((bound) => parseDate(bound)) : [];
}

export const ColumnDateFilter = ({ value, onChange }: ColumnFilterProps) => {
  const current = value[0];
  const [internalValue, setInternalValue] = useState<DateValue[]>(() => parseDateValue(current));
  const emit = useControlledMirror<string | undefined>({
    value: current || undefined,
    onValueChange: (next) => onChange(next ? [next] : undefined),
    onExternalChange: (next) => setInternalValue(parseDateValue(next)),
  });

  const handleValueChange = (next: DateValue[]) => {
    setInternalValue(next);
    if (next.length === 2)
      emit(serializeDateRangeFilter(formatIsoDate(next[0]), formatIsoDate(next[1])));
    else if (next.length === 0) emit(undefined);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && internalValue.length === 1) {
      setInternalValue([]);
      emit(undefined);
    }
  };

  return (
    <Box width="100%">
      <DatePickerSelect
        selectionMode="range"
        onValueChange={handleValueChange}
        onOpenChange={handleOpenChange}
        value={internalValue}
      />
    </Box>
  );
};
