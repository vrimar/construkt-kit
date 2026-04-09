import dayjs from "dayjs";
import { useMemo } from "react";
import { DatePickerSelect, type DateValue, parseDate } from "../../../DatePicker";

const DATE_RANGE_SEPARATOR = "<>";

interface ColumnDateFilterProps {
  dateValue: string;
  onChange: (value?: string) => unknown;
}

export const ColumnDateFilter = ({ dateValue, onChange }: ColumnDateFilterProps) => {
  const handleValueChange = (value: DateValue[]) => {
    const getLabel = (item: DateValue) =>
      `${item.year}-${String(item.month).padStart(2, "0")}-${String(item.day).padStart(2, "0")}`;

    if (value.length === 2)
      onChange(`${getLabel(value[0])}${DATE_RANGE_SEPARATOR}${getLabel(value[1])}`);
    else if (value.length === 0) onChange(undefined);
  };

  const value = useMemo(() => {
    const dateTokens = dateValue.split(DATE_RANGE_SEPARATOR);

    if (dateTokens?.length !== 2) return [];

    const start = dayjs(dateTokens[0]);
    const end = dayjs(dateTokens[1]);

    if (!start.isValid() || !end.isValid()) return [];

    return [parseDate(start.toDate()), parseDate(end.toDate())];
  }, [dateValue]);

  return (
    <DatePickerSelect
      selectionMode="range"
      onValueChange={handleValueChange}
      value={value}
    />
  );
};
