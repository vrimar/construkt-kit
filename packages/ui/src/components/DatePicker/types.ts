import type { ReactNode } from "react";

import type { JsxStyleProps } from "#styled-system/types";

import type { ChangeDetails } from "../../primitives/change";
import type { ButtonProps } from "../Buttons";
import type { PickerPopupProps } from "../pickerPopup";
import type { DateRangePreset, DateValue, DateView } from "./dateUtils";

export type { DateRangePreset, DateValue, DateView };

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

/** What picked the new dates: a day, month or year cell (pressed or Enter), a preset or a clear. */
export type DateValueChangeReason = "item-press" | "preset-press" | "clear-press";

/** Why `onValueChange` was called, and a way to keep the dates as they are. */
export type DateValueChangeDetails = ChangeDetails<DateValueChangeReason>;

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
  onValueChange?: (value: DateValue | undefined, details: DateValueChangeDetails) => void;
}

export interface RangeCalendarProps extends CalendarBaseProps {
  selectionMode: "range";
  value?: DateValue[];
  defaultValue?: DateValue[];
  onValueChange?: (value: DateValue[], details: DateValueChangeDetails) => void;
  presets?: RangePreset[];
  showPresets?: boolean;
}

export interface MultipleCalendarProps extends CalendarBaseProps {
  selectionMode: "multiple";
  value?: DateValue[];
  defaultValue?: DateValue[];
  onValueChange?: (value: DateValue[], details: DateValueChangeDetails) => void;
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

interface DatePickerExtraProps extends JsxStyleProps, PickerPopupProps {
  trigger?: ReactNode;
  placeholder?: string;
  formatValue?: (value: DateValue) => string;
  closeOnSelect?: boolean;
}

export type DatePickerProps<M extends CalendarMode = "single"> = CalendarProps<M> &
  DatePickerExtraProps;

interface DatePickerSelectExtraProps extends Omit<DatePickerExtraProps, "trigger"> {
  /** @default "sm" */
  size?: ButtonProps["size"];
  /** @default "plain" */
  variant?: ButtonProps["variant"];
}

export type DatePickerSelectProps<M extends CalendarMode = "single"> = CalendarProps<M> &
  DatePickerSelectExtraProps;
