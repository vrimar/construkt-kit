import type { DateValue } from "@ark-ui/react/date-picker";
import { formatIsoDate } from "@construkt-kit/utils";

export const getDisplayLabel = (
  value: DateValue[],
  selectionMode: "single" | "range" | "multiple",
  placeholder: string,
  formatValue: (value: DateValue) => string = formatIsoDate,
): string => {
  if (value.length === 0) return placeholder;
  if (selectionMode === "range" && value.length === 2) {
    return `${formatValue(value[0])} – ${formatValue(value[1])}`;
  }
  if (selectionMode === "multiple") return value.map(formatValue).join(", ");
  return formatValue(value[0]);
};
