import type { DateValue } from "@ark-ui/react/date-picker";
import type { ReactNode, RefObject } from "react";

export type DateView = "day" | "month" | "year";

export type DateRangePreset =
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "lastQuarter"
  | "thisYear"
  | "lastYear"
  | "last3Days"
  | "last7Days"
  | "last14Days"
  | "last30Days"
  | "last90Days";

export interface RangePreset {
  label: string;
  value: DateRangePreset;
}

export const defaultRangePresets: RangePreset[] = [
  { label: "Last 7 days", value: "last7Days" },
  { label: "Last 14 days", value: "last14Days" },
  { label: "Last 30 days", value: "last30Days" },
  { label: "Last 90 days", value: "last90Days" },
];

export interface CalendarBaseProps {
  numOfMonths?: number;
  startOfWeek?: number;
  locale?: string;
  timeZone?: string;
  fixedWeeks?: boolean;
  min?: DateValue;
  max?: DateValue;
  isDateUnavailable?: (date: DateValue, locale: string) => boolean;
  disabled?: boolean;
  readOnly?: boolean;
  defaultView?: DateView;
}

export type SingleCalendarProps = CalendarBaseProps & {
  selectionMode?: "single";
  value?: DateValue;
  defaultValue?: DateValue;
  onValueChange?: (value: DateValue | undefined) => void;
  clearable?: boolean;
};

export type RangeCalendarProps = CalendarBaseProps & {
  selectionMode: "range";
  value?: DateValue[];
  defaultValue?: DateValue[];
  onValueChange?: (value: DateValue[]) => void;
  presets?: RangePreset[];
  showPresets?: boolean;
  clearable?: boolean;
};

export type MultipleCalendarProps = CalendarBaseProps & {
  selectionMode: "multiple";
  value?: DateValue[];
  defaultValue?: DateValue[];
  onValueChange?: (value: DateValue[]) => void;
  maxSelectedDates?: number;
  clearable?: boolean;
};

export type CalendarProps = SingleCalendarProps | RangeCalendarProps | MultipleCalendarProps;

interface DatePickerExtraProps {
  trigger?: ReactNode;
  placeholder?: string;
  formatValue?: (value: DateValue) => string;
  portalled?: boolean;
  portalRef?: RefObject<HTMLElement>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnSelect?: boolean;
}

export type DatePickerProps =
  | (SingleCalendarProps & DatePickerExtraProps)
  | (RangeCalendarProps & DatePickerExtraProps)
  | (MultipleCalendarProps & DatePickerExtraProps);

export type DatePickerSelectProps =
  | (SingleCalendarProps & Omit<DatePickerExtraProps, "trigger">)
  | (RangeCalendarProps & Omit<DatePickerExtraProps, "trigger">)
  | (MultipleCalendarProps & Omit<DatePickerExtraProps, "trigger">);

/** Convert any CalendarProps/DatePickerProps value to DateValue[] for Ark UI.
 * Returns undefined when no value is provided (uncontrolled mode). */
export function toArkValue(props: CalendarProps | DatePickerProps): DateValue[] | undefined {
  if (props.value === undefined) return undefined;
  if (props.selectionMode === "range" || props.selectionMode === "multiple") {
    return props.value;
  }
  return [props.value];
}

/** Convert any CalendarProps/DatePickerProps defaultValue to DateValue[] for Ark UI */
export function toArkDefaultValue(props: CalendarProps | DatePickerProps): DateValue[] | undefined {
  if (props.selectionMode === "range" || props.selectionMode === "multiple") {
    return props.defaultValue;
  }
  return props.defaultValue ? [props.defaultValue] : undefined;
}

/** Fire the typed onValueChange callback */
export function fireValueChange(
  props: CalendarProps | DatePickerProps,
  arkValue: DateValue[],
): void {
  if (!props.onValueChange) return;
  if (props.selectionMode === "range" || props.selectionMode === "multiple") {
    (props.onValueChange as (v: DateValue[]) => void)(arkValue);
  } else {
    (props.onValueChange as (v: DateValue | undefined) => void)(arkValue[0] ?? undefined);
  }
}

/** Fire onValueChange with cleared value */
export function fireClear(props: CalendarProps | DatePickerProps): void {
  if (!props.onValueChange) return;
  if (props.selectionMode === "range" || props.selectionMode === "multiple") {
    (props.onValueChange as (v: DateValue[]) => void)([]);
  } else {
    (props.onValueChange as (v: DateValue | undefined) => void)(undefined);
  }
}

export type { DateValue };
