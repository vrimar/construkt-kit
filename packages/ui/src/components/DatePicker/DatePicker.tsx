import type { DateValue } from "@ark-ui/react/date-picker";
import { useDatePicker } from "@ark-ui/react/date-picker";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "../Buttons";
import { CalendarContent } from "./CalendarContent";
import { DatePickerContent } from "./DatePickerContent";
import * as Parts from "./parts";
import type { DatePickerProps } from "./types";
import { fireClear, fireValueChange, toArkDefaultValue, toArkValue } from "./types";

function formatDateValue(value: DateValue, formatValue?: (v: DateValue) => string): string {
  if (formatValue) return formatValue(value);
  return `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
}

export const DatePicker = (props: DatePickerProps) => {
  const {
    selectionMode = "single",
    numOfMonths = selectionMode === "range" ? 2 : 1,
    startOfWeek = 1,
    locale,
    timeZone,
    fixedWeeks,
    min,
    max,
    isDateUnavailable,
    disabled,
    readOnly,
    defaultView,
    clearable,
    trigger,
    placeholder = "Select date",
    formatValue,
    portalled = true,
    portalRef,
    open,
    defaultOpen,
    onOpenChange,
    closeOnSelect = true,
  } = props;

  const presets = "presets" in props ? props.presets : undefined;
  const showPresets = "showPresets" in props ? props.showPresets : undefined;

  const datePicker = useDatePicker({
    value: toArkValue(props),
    defaultValue: toArkDefaultValue(props),
    selectionMode,
    numOfMonths,
    startOfWeek,
    locale,
    timeZone,
    fixedWeeks,
    min,
    max,
    isDateUnavailable,
    disabled,
    readOnly,
    defaultView,
    open,
    defaultOpen,
    closeOnSelect,
    onValueChange: (details) => fireValueChange(props, details.value),
    onOpenChange: (details) => {
      onOpenChange?.(details.open);
    },
  });

  const displayLabel = (() => {
    const arkValue = datePicker.value;
    if (arkValue.length === 0) return placeholder;
    if (selectionMode === "range" && arkValue.length === 2) {
      return `${formatDateValue(arkValue[0], formatValue)} – ${formatDateValue(arkValue[1], formatValue)}`;
    }
    if (selectionMode === "multiple") {
      return arkValue.map((v) => formatDateValue(v, formatValue)).join(", ");
    }
    return formatDateValue(arkValue[0], formatValue);
  })();

  const defaultTrigger = (
    <Button
      variant="outline"
      width="full"
      justifyContent="space-between"
      disabled={disabled}
    >
      {displayLabel}
      <ChevronDownIcon />
    </Button>
  );

  return (
    <Parts.RootProvider value={datePicker}>
      <Parts.Root width="100%">
        <Parts.Control>
          <Parts.Trigger asChild>{trigger ?? defaultTrigger}</Parts.Trigger>
        </Parts.Control>

        <DatePickerContent
          portalled={portalled}
          portalRef={portalRef}
        >
          <CalendarContent
            numOfMonths={numOfMonths}
            presets={presets}
            showPresets={showPresets}
            clearable={clearable}
            onClear={() => fireClear(props)}
          />
        </DatePickerContent>
      </Parts.Root>
    </Parts.RootProvider>
  );
};
