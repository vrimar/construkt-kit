import { useMemo } from "react";

import { CloseButton } from "../Buttons/CloseButton";
import { SelectButton } from "../Buttons/SelectButton";
import { DatePicker } from "./DatePicker";
import { formatDateValue } from "./format";
import type { DatePickerProps, DatePickerSelectProps } from "./types";
import { fireClear } from "./types";

export const DatePickerSelect = (props: DatePickerSelectProps) => {
  const rawValue = props.value;
  const value = useMemo(
    () => (rawValue === undefined ? [] : Array.isArray(rawValue) ? rawValue : [rawValue]),
    [rawValue],
  );

  const label = useMemo(() => {
    const fmt = props.formatValue ?? formatDateValue;
    return value.map(fmt).join(" – ");
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
