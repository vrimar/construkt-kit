import { useDatePickerContext } from "@ark-ui/react/date-picker";
import type { ComponentProps, JSX } from "react";

import { splitCssProps } from "#styled-system/jsx";

import { SelectButton } from "../Buttons";
import { useFieldTriggerProps } from "../fieldTrigger";
import { type MobileLayoutProps, withMobileLayoutProvider } from "../overlayPresentation";
import { createSheetCapableContent } from "../sheetFrame";
import { CalendarContent } from "./CalendarContent";
import { getDisplayLabel } from "./format";
import * as Parts from "./parts";
import type { CalendarMode, DatePickerProps } from "./types";
import { useCalendarMachine } from "./useCalendarMachine";

const RootProvider = withMobileLayoutProvider<
  ComponentProps<typeof Parts.RootProvider> & MobileLayoutProps
>(Parts.RootProvider);

const DatePickerContent = createSheetCapableContent(
  Parts.Positioner,
  Parts.Content,
  useDatePickerContext,
);

export const DatePickerBase = (props: DatePickerProps<CalendarMode>) => {
  const [styleProps, pickerProps] = splitCssProps(props);
  const {
    trigger,
    placeholder,
    formatValue,
    portalled = true,
    portalRef,
    open,
    defaultOpen,
    onOpenChange,
    closeOnSelect = true,
    mobileLayout,
  } = pickerProps;

  const { api, contentProps } = useCalendarMachine(pickerProps, {
    open,
    defaultOpen,
    closeOnSelect,
    onOpenChange: (details) => {
      onOpenChange?.(details.open);
    },
  });
  const fieldProps = useFieldTriggerProps(api.getTriggerProps().id);

  return (
    <RootProvider
      value={api}
      mobileLayout={mobileLayout}
      {...styleProps}
    >
      <Parts.Control>
        <Parts.Trigger
          asChild
          {...fieldProps}
        >
          {trigger ?? (
            <SelectButton
              variant="outline"
              width="full"
              hasValue={api.value.length > 0}
              label={getDisplayLabel(api.value, api.selectionMode, placeholder, formatValue)}
            />
          )}
        </Parts.Trigger>
      </Parts.Control>

      <DatePickerContent
        portalled={portalled}
        portalRef={portalRef}
      >
        <CalendarContent {...contentProps} />
      </DatePickerContent>
    </RootProvider>
  );
};

// One signature per mode: a union of modes with style props breaks Omit on its ComponentProps.
interface DatePickerComponent {
  (props: DatePickerProps): JSX.Element;
  (props: DatePickerProps<"range">): JSX.Element;
  (props: DatePickerProps<"multiple">): JSX.Element;
}

export const DatePicker: DatePickerComponent = DatePickerBase;
