import type { JSX } from "react";

import { splitCssProps } from "#styled-system/jsx";

import { SelectButton } from "../Buttons";
import { useFieldTriggerProps } from "../fieldTrigger";
import { getPickerTriggerProps, usePickerPopup } from "../pickerPopup";
import { asRender } from "../renderContent";
import {
  CalendarBody,
  CalendarProviders,
  calendarRootAttributes,
  focusedCell,
  useCalendarRoot,
} from "./calendarRoot";
import { getDisplayLabel } from "./format";
import * as Parts from "./parts";
import type { CalendarMode, DatePickerProps } from "./types";

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

  const popup = usePickerPopup({
    open,
    defaultOpen,
    onOpenChange,
    mobileLayout,
    placement,
    initialFocus: focusedCell,
  });
  const calendar = useCalendarRoot(pickerProps, popup);
  const fieldProps = useFieldTriggerProps(popup.ids.trigger);

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
            {...getPickerTriggerProps(popup, { interactive: calendar.interactive })}
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

        <CalendarBody props={pickerProps} />
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
