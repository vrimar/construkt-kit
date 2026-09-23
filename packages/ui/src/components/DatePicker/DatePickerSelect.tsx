import { type DateValue, useDatePickerContext } from "@ark-ui/react/date-picker";

import { CloseButton, SelectButton, type SelectButtonProps } from "../Buttons";
import { DatePicker } from "./DatePicker";
import { getDisplayLabel } from "./format";
import type { DatePickerSelectProps } from "./types";

interface DatePickerSelectTriggerProps extends Omit<SelectButtonProps, "hasValue" | "label"> {
  selectionMode: "single" | "range" | "multiple";
  placeholder: string;
  formatValue?: (value: DateValue) => string;
}

function DatePickerSelectTrigger({
  selectionMode,
  placeholder,
  formatValue,
  ...props
}: DatePickerSelectTriggerProps) {
  const { value } = useDatePickerContext();

  return (
    <SelectButton
      width="100%"
      {...props}
      hasValue={value.length > 0}
      label={getDisplayLabel(value, selectionMode, placeholder, formatValue)}
    />
  );
}

function DatePickerSelectClear({ disabled }: { disabled?: boolean }) {
  const datePicker = useDatePickerContext();
  if (datePicker.value.length === 0) return null;

  return (
    <CloseButton
      aria-label="Clear date"
      disabled={disabled}
      onClick={() => datePicker.clearValue()}
      size="sm"
    />
  );
}

export const DatePickerSelect = ({
  size = "sm",
  variant = "plain",
  ...props
}: DatePickerSelectProps) => (
  <DatePicker
    {...props}
    trigger={
      <DatePickerSelectTrigger
        selectionMode={props.selectionMode ?? "single"}
        placeholder={props.placeholder ?? "Select date"}
        formatValue={props.formatValue}
        size={size}
        variant={variant}
      />
    }
    triggerEndElement={<DatePickerSelectClear disabled={props.disabled || props.readOnly} />}
  />
);
