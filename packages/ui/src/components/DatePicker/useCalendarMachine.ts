import { type UseDatePickerProps, useDatePicker } from "@ark-ui/react/date-picker";

import { useIsMobile } from "../../hooks";
import type { CalendarProps } from "./types";
import { fireValueChange, toArkDefaultValue, toArkValue } from "./types";

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
  } = props;

  // A single month fits a phone; multi-month ranges overflow ~640px otherwise.
  const months = useIsMobile() ? 1 : numOfMonths;

  const api = useDatePicker({
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
    onValueChange: (details) => fireValueChange(props, details.value),
    ...extra,
  });

  return {
    api,
    contentProps: {
      numOfMonths: months,
      presets: "presets" in props ? props.presets : undefined,
      showPresets: "showPresets" in props ? props.showPresets : undefined,
      clearable,
      onClear: () => api.clearValue(),
    },
  };
}
