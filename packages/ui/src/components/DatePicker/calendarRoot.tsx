import type { ReactNode } from "react";

import { useIsMobile } from "../../hooks";
import { useFieldControlState } from "../../primitives/field";
import { useLocale } from "../../primitives/locale";
import type { Popup } from "../../primitives/popup";
import { dataAttr, fieldStateAttributes } from "../../primitives/render";
import { PickerPopupProvider } from "../popup";
import type { DateValue } from "./dateUtils";
import type { CalendarMode, CalendarProps, DateValueChangeDetails } from "./types";
import { type Calendar, CalendarContext, useCalendar } from "./useCalendar";

function toValue(props: CalendarProps<CalendarMode>): DateValue[] | undefined {
  if (!("value" in props)) return undefined;
  if (props.selectionMode === "range" || props.selectionMode === "multiple") {
    return props.value ?? [];
  }
  return props.value ? [props.value] : [];
}

function toDefaultValue(props: CalendarProps<CalendarMode>): DateValue[] | undefined {
  if (props.selectionMode === "range" || props.selectionMode === "multiple") {
    return props.defaultValue;
  }
  return props.defaultValue ? [props.defaultValue] : undefined;
}

function fireValueChange(
  props: CalendarProps<CalendarMode>,
  value: DateValue[],
  details: DateValueChangeDetails,
): void {
  if (props.selectionMode === "range" || props.selectionMode === "multiple") {
    props.onValueChange?.(value, details);
  } else {
    props.onValueChange?.(value[0], details);
  }
}

/** A calendar's state for its props, inside the `Field` and `LocaleProvider` around it. */
export function useCalendarRoot(
  props: CalendarProps<CalendarMode> & { closeOnSelect?: boolean | undefined },
  popup: Popup,
): Calendar {
  const {
    closeOnSelect = true,
    selectionMode = "single",
    numOfMonths = selectionMode === "range" ? 2 : 1,
    startOfWeek = 1,
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
    fixedWeeks = false,
    defaultView = "day",
  } = props;
  const context = useLocale();
  const field = useFieldControlState({ disabled: props.disabled, readOnly: props.readOnly });
  const isMobile = useIsMobile();

  return useCalendar({
    selectionMode,
    value: toValue(props),
    defaultValue: toDefaultValue(props),
    onValueChange: (value, details) => fireValueChange(props, value, details),
    numOfMonths: isMobile ? 1 : numOfMonths,
    startOfWeek,
    locale: props.locale ?? context.locale,
    dir: context.dir,
    timeZone,
    fixedWeeks,
    min: props.min,
    max: props.max,
    isDateUnavailable: props.isDateUnavailable,
    disabled: field.disabled,
    readOnly: field.readOnly,
    defaultView,
    maxSelectedDates: "maxSelectedDates" in props ? props.maxSelectedDates : undefined,
    open: popup.open,
    closeOnSelect,
    requestClose: (event) => popup.requestOpenChange(false, "item-press", event),
    getContainer: () => popup.contentEl,
  });
}

export const calendarRootAttributes = (calendar: Calendar) => ({
  ...fieldStateAttributes({ disabled: calendar.disabled, readOnly: calendar.readOnly }),
  "data-empty": dataAttr(calendar.value.length === 0),
});

interface CalendarProvidersProps {
  popup: Popup;
  calendar: Calendar;
  children: ReactNode;
}

export function CalendarProviders({ popup, calendar, children }: CalendarProvidersProps) {
  return (
    <PickerPopupProvider popup={popup}>
      <CalendarContext value={calendar}>{children}</CalendarContext>
    </PickerPopupProvider>
  );
}
