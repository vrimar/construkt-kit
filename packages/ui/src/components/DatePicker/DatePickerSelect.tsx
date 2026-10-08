import { type DateValue, useDatePickerContext } from "@ark-ui/react/date-picker";

import { CloseButton, SelectButton, type SelectButtonProps } from "../Buttons";
import { DatePicker } from "./DatePicker";
import { getDisplayLabel } from "./format";
import type { DatePickerSelectProps } from "./types";

interface DatePickerSelectTriggerProps extends Omit<SelectButtonProps, "hasValue" | "label"> {
  placeholder?: string;
  formatValue?: (value: DateValue) => string;
}

function DatePickerSelectTrigger({
  placeholder,
  formatValue,
  ...props
}: DatePickerSelectTriggerProps) {
  const { value, selectionMode } = useDatePickerContext();

  return (
    <SelectButton
      width="100%"
      {...props}
      hasValue={value.length > 0}
      label={getDisplayLabel(value, selectionMode, placeholder, formatValue)}
    />
  );
}

function DatePickerSelectClear({ label }: { label: string }) {
  const datePicker = useDatePickerContext();
  if (datePicker.value.length === 0) return null;

  return (
    <CloseButton
      aria-label={label}
      disabled={datePicker.disabled || datePicker.readOnly}
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
        placeholder={props.placeholder}
        formatValue={props.formatValue}
        size={size}
        variant={variant}
      />
    }
    triggerEndElement={<DatePickerSelectClear label={props.clearLabel ?? "Clear date"} />}
  />
);
