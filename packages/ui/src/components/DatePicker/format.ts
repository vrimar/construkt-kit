import { formatIsoDate } from "@construkt-kit/utils";

import { joinRange } from "../../foundations/rangeText";
import { type DateValue, joinDates } from "./dateUtils";
import type { CalendarMode } from "./types";

export const getDisplayLabel = (
  value: DateValue[],
  selectionMode: CalendarMode,
  placeholder = "Select date",
  formatValue: (value: DateValue) => string = formatIsoDate,
): string => {
  if (value.length === 0) return placeholder;
  if (selectionMode === "range" && value.length === 2) {
    return joinRange(formatValue(value[0]), formatValue(value[1]));
  }
  if (selectionMode === "multiple") return joinDates(value.map(formatValue));
  return formatValue(value[0]);
};
