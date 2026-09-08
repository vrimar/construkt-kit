import { Box } from "@construkt-kit/styled-system/jsx";
import { FILTER_RANGE_SEPARATOR } from "@construkt-kit/utils";
import dayjs from "dayjs";
import { useState } from "react";

import { useControlledMirror } from "../../../../hooks/useControlledMirror";
import { DatePickerSelect, type DateValue, parseDate } from "../../../DatePicker";
import { formatDateValue } from "../../../DatePicker/format";

interface ColumnDateFilterProps {
  dateValue: string;
  onChange: (value?: string) => unknown;
}

function parseDateValue(dateValue: string | undefined): DateValue[] {
  if (!dateValue) return [];
  const dateTokens = dateValue.split(FILTER_RANGE_SEPARATOR);
  if (dateTokens.length !== 2) return [];
  const start = dayjs(dateTokens[0]);
  const end = dayjs(dateTokens[1]);
  if (!start.isValid() || !end.isValid()) return [];
  return [parseDate(start.toDate()), parseDate(end.toDate())];
}

export const ColumnDateFilter = ({ dateValue, onChange }: ColumnDateFilterProps) => {
  const [internalValue, setInternalValue] = useState<DateValue[]>(() => parseDateValue(dateValue));
  const emit = useControlledMirror<string | undefined>({
    value: dateValue || undefined,
    onValueChange: onChange,
    onExternalChange: (next) => setInternalValue(parseDateValue(next)),
  });

  const handleValueChange = (value: DateValue[]) => {
    setInternalValue(value);
    if (value.length === 2)
      emit(`${formatDateValue(value[0])}${FILTER_RANGE_SEPARATOR}${formatDateValue(value[1])}`);
    else if (value.length === 0) emit(undefined);
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
