import { ChevronDownIcon } from "lucide-react";

import { splitCssProps } from "#styled-system/jsx";

import { Button } from "../Buttons";
import { createPortalledContent } from "../portalledContent";
import { CalendarContent } from "./CalendarContent";
import { getDisplayLabel } from "./format";
import * as Parts from "./parts";
import type { DatePickerProps } from "./types";
import { useCalendarMachine } from "./useCalendarMachine";

const DatePickerContent = createPortalledContent(Parts.Positioner, Parts.Content);

export const DatePicker = (props: DatePickerProps) => {
  const [styleProps, pickerProps] = splitCssProps(props);
  const {
    trigger,
    triggerEndElement,
    placeholder,
    formatValue,
    portalled = true,
    portalRef,
    open,
    defaultOpen,
    onOpenChange,
    closeOnSelect = true,
  } = pickerProps;

  const { api, contentProps } = useCalendarMachine(pickerProps, {
    open,
    defaultOpen,
    closeOnSelect,
    onOpenChange: (details) => {
      onOpenChange?.(details.open);
    },
  });

  const displayLabel = getDisplayLabel(api.value, api.selectionMode, placeholder, formatValue);

  const defaultTrigger = (
    <Button
      variant="outline"
      width="full"
      justifyContent="space-between"
    >
      {displayLabel}
      <ChevronDownIcon />
    </Button>
  );

  return (
    <Parts.RootProvider
      value={api}
      {...styleProps}
    >
      <Parts.Control>
        <Parts.Trigger asChild>{trigger ?? defaultTrigger}</Parts.Trigger>
        {triggerEndElement}
      </Parts.Control>

      <DatePickerContent
        portalled={portalled}
        portalRef={portalRef}
      >
        <CalendarContent {...contentProps} />
      </DatePickerContent>
    </Parts.RootProvider>
  );
};
