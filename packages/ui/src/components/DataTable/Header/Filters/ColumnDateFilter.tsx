import {
  formatIsoDate,
  parseDateRangeFilter,
  serializeDateRangeFilter,
} from "@construkt-kit/utils";
import { useEffect, useState } from "react";

import { useControlledMirror } from "../../../../hooks/useControlledMirror";
import { DatePickerSelect, type DateValue, parseDate } from "../../../DatePicker";
import { useDataTableContext } from "../../context";
import type { ColumnFilterProps } from "../../types";

function parseDateValue(dateValue: string | undefined): DateValue[] {
  const range = dateValue ? parseDateRangeFilter(dateValue) : undefined;
  return range ? range.map((bound) => parseDate(bound)) : [];
}

export const ColumnDateFilter = ({ placeholder, value, onChange }: ColumnFilterProps) => {
  const { labels } = useDataTableContext();
  const current = value[0];
  const malformed = !!current && !parseDateRangeFilter(current);
  const [internalValue, setInternalValue] = useState<DateValue[]>(() => parseDateValue(current));
  const [appliedValue, setAppliedValue] = useState(current || undefined);
  const emitToParent = useControlledMirror<string | undefined>({
    value: current || undefined,
    onValueChange: (next) => onChange(next ? [next] : undefined),
    onExternalChange: (next) => {
      setAppliedValue(next);
      setInternalValue(parseDateValue(next));
    },
  });

  useEffect(() => {
    if (malformed) onChange(undefined);
  }, [malformed, onChange]);

  const emit = (next: string | undefined) => {
    setAppliedValue(next);
    emitToParent(next);
  };

  const handleValueChange = (next: DateValue[]) => {
    setInternalValue(next);
    if (next.length === 2)
      emit(serializeDateRangeFilter(formatIsoDate(next[0]), formatIsoDate(next[1])));
    else if (next.length === 0) emit(undefined);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open)
      setInternalValue((picked) => (picked.length === 1 ? parseDateValue(appliedValue) : picked));
  };

  return (
    <DatePickerSelect
      width="100%"
      selectionMode="range"
      placeholder={placeholder}
      clearLabel={labels.clearDate}
      onValueChange={handleValueChange}
      onOpenChange={handleOpenChange}
      value={internalValue}
    />
  );
};
