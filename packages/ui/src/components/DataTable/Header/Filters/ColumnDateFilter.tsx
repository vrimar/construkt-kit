import { DatePickerSelect, type DateValue, parseDate } from "../../../DatePicker";
import dayjs from "dayjs";
import { useMemo } from "react";

interface Props {
  dateValue: string;
  onChange: (value?: string) => unknown;
}

export const ColumnDateFilter = ({ dateValue, onChange }: Props) => {
  const handleValueChange = (value: DateValue[]) => {
    const getLabel = (item: DateValue) => `${item.year}-${item.month}-${item.day}`;

    if (value.length === 2) onChange(`${getLabel(value[0])}<>${getLabel(value[1])}`);
    else if (value.length === 0) onChange(undefined);
  };

  const value = useMemo(() => {
    const dateTokens = dateValue.split("<>");

    if (!dateTokens || dateTokens.length !== 2) return [];

    const start = dayjs(dateTokens[0]);
    const end = dayjs(dateTokens[1]);

    if (!start.isValid() || !end.isValid()) return [];

    return [parseDate(start.toDate()), parseDate(end.toDate())];
  }, [dateValue]);

  return (
    <DatePickerSelect
      onValueChange={handleValueChange}
      value={value}
    />
  );
};
