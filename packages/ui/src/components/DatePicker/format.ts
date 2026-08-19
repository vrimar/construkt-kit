import type { DateValue } from "@ark-ui/react/date-picker";

/** ISO `YYYY-MM-DD`; also the wire format for the DataTable date filter, so keep it stable. */
export const formatDateValue = (value: DateValue): string =>
  `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;

export const getDisplayLabel = (
  value: DateValue[],
  selectionMode: "single" | "range" | "multiple",
  placeholder: string,
  formatValue: (value: DateValue) => string = formatDateValue,
): string => {
  if (value.length === 0) return placeholder;
  if (selectionMode === "range" && value.length === 2) {
    return `${formatValue(value[0])} – ${formatValue(value[1])}`;
  }
  if (selectionMode === "multiple") return value.map(formatValue).join(", ");
  return formatValue(value[0]);
};
