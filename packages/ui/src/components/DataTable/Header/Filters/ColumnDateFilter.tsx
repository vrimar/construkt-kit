import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Box } from "styled-system/jsx";
import { DatePickerSelect, type DateValue, parseDate } from "../../../DatePicker";

const DATE_RANGE_SEPARATOR = "<>";

interface ColumnDateFilterProps {
  dateValue: string;
  onChange: (value?: string) => unknown;
}

function parseDateValue(dateValue: string): DateValue[] {
  if (!dateValue) return [];
  const dateTokens = dateValue.split(DATE_RANGE_SEPARATOR);
  if (dateTokens.length !== 2) return [];
  const start = dayjs(dateTokens[0]);
  const end = dayjs(dateTokens[1]);
  if (!start.isValid() || !end.isValid()) return [];
  return [parseDate(start.toDate()), parseDate(end.toDate())];
}

function formatDateValue(item: DateValue): string {
  return `${item.year}-${String(item.month).padStart(2, "0")}-${String(item.day).padStart(2, "0")}`;
}

export const ColumnDateFilter = ({ dateValue, onChange }: ColumnDateFilterProps) => {
  const [internalValue, setInternalValue] = useState<DateValue[]>(() => parseDateValue(dateValue));

  useEffect(() => {
    setInternalValue(parseDateValue(dateValue));
  }, [dateValue]);

  const handleValueChange = (value: DateValue[]) => {
    setInternalValue(value);
    if (value.length === 2)
      onChange(`${formatDateValue(value[0])}${DATE_RANGE_SEPARATOR}${formatDateValue(value[1])}`);
    else if (value.length === 0) onChange(undefined);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && internalValue.length === 1) {
      setInternalValue([]);
      onChange(undefined);
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
