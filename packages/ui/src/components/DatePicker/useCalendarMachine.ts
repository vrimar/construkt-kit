import { type DateValue, type UseDatePickerProps, useDatePicker } from "@ark-ui/react/date-picker";

import { useIsMobile } from "../../hooks";
import type { CalendarProps } from "./types";

function toArkValue(props: CalendarProps): DateValue[] | undefined {
  if (!("value" in props)) return undefined;
  if (props.selectionMode === "range" || props.selectionMode === "multiple") {
    return props.value ?? [];
  }
  return props.value ? [props.value] : [];
}

function toArkDefaultValue(props: CalendarProps): DateValue[] | undefined {
  if (props.selectionMode === "range" || props.selectionMode === "multiple") {
    return props.defaultValue;
  }
  return props.defaultValue ? [props.defaultValue] : undefined;
}

function fireValueChange(props: CalendarProps, arkValue: DateValue[]): void {
  if (!props.onValueChange) return;
  if (props.selectionMode === "range" || props.selectionMode === "multiple") {
    props.onValueChange(arkValue);
  } else {
    props.onValueChange(arkValue[0] ?? undefined);
  }
}

export function useCalendarMachine(props: CalendarProps, extra: Partial<UseDatePickerProps> = {}) {
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
    clearLabel,
  } = props;

  const isMobile = useIsMobile();
  // A single month fits a phone; multi-month ranges overflow ~640px otherwise.
  const months = isMobile ? 1 : numOfMonths;

  const api = useDatePicker({
    value: toArkValue(props),
    defaultValue: toArkDefaultValue(props),
    selectionMode,
    maxSelectedDates: "maxSelectedDates" in props ? props.maxSelectedDates : undefined,
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
    onValueChange: (details) => fireValueChange(props, details.value),
    ...extra,
  });

  return {
    api,
    contentProps: {
      isMobile,
      presets: "presets" in props ? props.presets : undefined,
      showPresets: "showPresets" in props ? props.showPresets : undefined,
      clearable,
      clearLabel,
    },
  };
}
