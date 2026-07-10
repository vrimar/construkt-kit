import type { DateValue } from "@ark-ui/react/date-picker";
import { useMemo } from "react";

import { CloseButton } from "../Buttons/CloseButton";
import { SelectButton } from "../Buttons/SelectButton";
import { DatePicker } from "./DatePicker";
import type { DatePickerProps, DatePickerSelectProps } from "./types";
import { fireClear, toArkValue } from "./types";

function formatDateValue(value: DateValue): string {
  return `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
}

export const DatePickerSelect = (props: DatePickerSelectProps) => {
  const value = toArkValue(props) ?? [];

  const label = useMemo(() => {
    const fmt = props.formatValue ?? formatDateValue;
    return value.map(fmt).join(" – ");
    // oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
  }, [value, props.formatValue]);

  const hasValue = value.length > 0;

  const datePickerProps = {
    ...props,
    trigger: (
      <SelectButton
        hasValue={hasValue}
        label={label || props.placeholder || "Select date"}
        variant="plain"
        width="100%"
        size="sm"
      />
    ),
    triggerEndElement: hasValue ? (
      <CloseButton
        aria-label="Clear date"
        disabled={props.disabled || props.readOnly}
        onClick={() => fireClear(props)}
        size="sm"
      />
    ) : undefined,
  } as DatePickerProps;

  return <DatePicker {...datePickerProps} />;
};
