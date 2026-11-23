import type { JSX } from "react";

import { splitCssProps } from "#styled-system/jsx";

import { useFieldTriggerProps } from "../../primitives/field";
import { usePopup } from "../../primitives/popup";
import { SelectButton } from "../Buttons";
import { getPopupToggleProps } from "../popup";
import { asRender } from "../renderContent";
import { CalendarContent } from "./CalendarContent";
import { CalendarProviders, calendarRootAttributes, useCalendarRoot } from "./calendarRoot";
import { getDisplayLabel } from "./format";
import * as Parts from "./parts";
import type { CalendarMode, DatePickerProps } from "./types";
import { focusedCell } from "./useCalendar";

export function DatePickerBase(props: DatePickerProps<CalendarMode>) {
  const [styleProps, pickerProps] = splitCssProps(props);
  const {
    trigger,
    placeholder,
    formatValue,
    open,
    defaultOpen,
    onOpenChange,
    mobileLayout,
    placement,
  } = pickerProps;

  const popup = usePopup({
    idPrefix: "picker",
    open,
    defaultOpen,
    onOpenChange,
    mobileLayout,
    placement,
    initialFocus: focusedCell,
  });
  const calendar = useCalendarRoot(pickerProps, popup);
  const fieldProps = useFieldTriggerProps(popup);

  return (
    <CalendarProviders
      popup={popup}
      calendar={calendar}
    >
      <Parts.Root
        {...calendarRootAttributes(calendar)}
        {...styleProps}
      >
        <Parts.Control>
          <Parts.Trigger
            {...getPopupToggleProps(popup, { interactive: calendar.interactive })}
            disabled={calendar.disabled}
            {...fieldProps}
            {...asRender(
              trigger ?? (
                <SelectButton
                  variant="outline"
                  width="full"
                  hasValue={calendar.value.length > 0}
                  label={getDisplayLabel(
                    calendar.value,
                    calendar.selectionMode,
                    placeholder,
                    formatValue,
                  )}
                />
              ),
            )}
          />
        </Parts.Control>

        <CalendarContent props={pickerProps} />
        {calendar.liveRegion}
      </Parts.Root>
    </CalendarProviders>
  );
}

// One signature per mode: a union of modes with style props breaks Omit on its ComponentProps.
interface DatePickerComponent {
  (props: DatePickerProps): JSX.Element;
  (props: DatePickerProps<"range">): JSX.Element;
  (props: DatePickerProps<"multiple">): JSX.Element;
}

export const DatePicker: DatePickerComponent = DatePickerBase;
