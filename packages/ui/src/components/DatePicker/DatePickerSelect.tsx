import type { JSX } from "react";

import { SelectButton, type SelectButtonProps } from "../Buttons";
import { DatePickerBase } from "./DatePicker";
import type { DateValue } from "./dateUtils";
import { getDisplayLabel } from "./format";
import type { CalendarMode, DatePickerSelectProps } from "./types";
import { useCalendarContext } from "./useCalendar";

interface DatePickerSelectTriggerProps extends Omit<
  SelectButtonProps,
  "hasValue" | "label" | "onClear"
> {
  placeholder?: string | undefined;
  formatValue?: ((value: DateValue) => string) | undefined;
}

function DatePickerSelectTrigger({
  placeholder,
  formatValue,
  ...props
}: DatePickerSelectTriggerProps) {
  const calendar = useCalendarContext();
  const hasValue = calendar.value.length > 0;

  return (
    <SelectButton
      width="100%"
      {...props}
      hasValue={hasValue}
      label={getDisplayLabel(calendar.value, calendar.selectionMode, placeholder, formatValue)}
      onClear={
        hasValue && !calendar.readOnly
          ? () => calendar.clear(undefined, { focusCell: false })
          : undefined
      }
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
