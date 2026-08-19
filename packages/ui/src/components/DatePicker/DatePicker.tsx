import { useDatePicker } from "@ark-ui/react/date-picker";
import { ChevronDownIcon } from "lucide-react";

import { useIsMobile } from "../../hooks";
import { Button } from "../Buttons";
import { CalendarContent } from "./CalendarContent";
import { DatePickerContent } from "./DatePickerContent";
import { getDisplayLabel } from "./format";
import * as Parts from "./parts";
import type { DatePickerProps } from "./types";
import { fireClear, fireValueChange, toArkDefaultValue, toArkValue } from "./types";

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
    triggerEndElement,
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

  // A single month fits a phone; multi-month ranges overflow ~640px otherwise.
  const months = useIsMobile() ? 1 : numOfMonths;

  const datePicker = useDatePicker({
    value: toArkValue(props),
    defaultValue: toArkDefaultValue(props),
    selectionMode,
    numOfMonths: months,
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

  const displayLabel = getDisplayLabel(datePicker.value, selectionMode, placeholder, formatValue);

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
          {triggerEndElement}
        </Parts.Control>

        <DatePickerContent
          portalled={portalled}
          portalRef={portalRef}
        >
          <CalendarContent
            numOfMonths={months}
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
