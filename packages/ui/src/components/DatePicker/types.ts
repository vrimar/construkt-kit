import type {
  DatePickerDateRangePreset,
  DatePickerDateView,
  DateValue,
} from "@ark-ui/react/date-picker";
import type { ReactNode } from "react";

import type { JsxStyleProps } from "#styled-system/types";

import type { PortalledProps } from "../../types";
import type { ButtonProps } from "../Buttons";

export type DateView = DatePickerDateView;

export type DateRangePreset = DatePickerDateRangePreset;

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
  clearable?: boolean;
  /** Label of the clear controls. */
  clearLabel?: string;
}

export type CalendarMode = "single" | "range" | "multiple";

export interface SingleCalendarProps extends CalendarBaseProps {
  selectionMode?: "single";
  value?: DateValue;
  defaultValue?: DateValue;
  onValueChange?: (value: DateValue | undefined) => void;
}

export interface RangeCalendarProps extends CalendarBaseProps {
  selectionMode: "range";
  value?: DateValue[];
  defaultValue?: DateValue[];
  onValueChange?: (value: DateValue[]) => void;
  presets?: RangePreset[];
  showPresets?: boolean;
}

export interface MultipleCalendarProps extends CalendarBaseProps {
  selectionMode: "multiple";
  value?: DateValue[];
  defaultValue?: DateValue[];
  onValueChange?: (value: DateValue[]) => void;
  maxSelectedDates?: number;
}

interface CalendarPropsByMode {
  single: SingleCalendarProps;
  range: RangeCalendarProps;
  multiple: MultipleCalendarProps;
}

/**
 * Calendar props for one mode. Passing `CalendarMode` gives a union of modes, which `Omit` and
 * `Pick` can't resolve once style props join it.
 */
export type CalendarProps<M extends CalendarMode = "single"> = CalendarPropsByMode[M];

interface DatePickerExtraProps extends PortalledProps, JsxStyleProps {
  trigger?: ReactNode;
  triggerEndElement?: ReactNode;
  placeholder?: string;
  formatValue?: (value: DateValue) => string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnSelect?: boolean;
}

export type DatePickerProps<M extends CalendarMode = "single"> = CalendarProps<M> &
  DatePickerExtraProps;

interface DatePickerSelectExtraProps extends Omit<
  DatePickerExtraProps,
  "trigger" | "triggerEndElement"
> {
  /** @default "sm" */
  size?: ButtonProps["size"];
  /** @default "plain" */
  variant?: ButtonProps["variant"];
}

export type DatePickerSelectProps<M extends CalendarMode = "single"> = CalendarProps<M> &
  DatePickerSelectExtraProps;

export type { DateValue };
