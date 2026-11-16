import { type DateValue, useDatePickerContext } from "@ark-ui/react/date-picker";
import type { JSX } from "react";

import { SelectButton, type SelectButtonProps } from "../Buttons";
import { DatePickerBase } from "./DatePicker";
import { getDisplayLabel } from "./format";
import type { CalendarMode, DatePickerSelectProps } from "./types";

interface DatePickerSelectTriggerProps extends Omit<
  SelectButtonProps,
  "hasValue" | "label" | "onClear"
> {
  placeholder?: string;
  formatValue?: (value: DateValue) => string;
}

function DatePickerSelectTrigger({
  placeholder,
  formatValue,
  ...props
}: DatePickerSelectTriggerProps) {
  const datePicker = useDatePickerContext();
  const hasValue = datePicker.value.length > 0;

  return (
    <SelectButton
      width="100%"
      {...props}
      hasValue={hasValue}
      label={getDisplayLabel(datePicker.value, datePicker.selectionMode, placeholder, formatValue)}
      onClear={hasValue && !datePicker.readOnly ? () => datePicker.clearValue() : undefined}
    />
  );
}

const DatePickerSelectBase = ({
  size = "sm",
  variant = "plain",
  ...props
}: DatePickerSelectProps<CalendarMode>) => (
  <DatePickerBase
    {...props}
    trigger={
      <DatePickerSelectTrigger
        placeholder={props.placeholder}
        formatValue={props.formatValue}
        size={size}
        variant={variant}
        clearLabel={props.clearLabel ?? "Clear date"}
      />
    }
  />
);

interface DatePickerSelectComponent {
  (props: DatePickerSelectProps): JSX.Element;
  (props: DatePickerSelectProps<"range">): JSX.Element;
  (props: DatePickerSelectProps<"multiple">): JSX.Element;
}

export const DatePickerSelect: DatePickerSelectComponent = DatePickerSelectBase;
