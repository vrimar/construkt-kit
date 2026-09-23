import { ChevronDownIcon } from "lucide-react";

import { Button } from "../Buttons";
import { createPortalledContent } from "../portalledContent";
import { CalendarContent } from "./CalendarContent";
import { getDisplayLabel } from "./format";
import * as Parts from "./parts";
import type { DatePickerProps } from "./types";
import { useCalendarMachine } from "./useCalendarMachine";

const DatePickerContent = createPortalledContent(Parts.Positioner, Parts.Content);

export const DatePicker = (props: DatePickerProps) => {
  const {
    selectionMode = "single",
    disabled,
    trigger,
    triggerEndElement,
    placeholder = "Select date",
    formatValue,
    portalled = true,
    portalRef,
    open,
    defaultOpen,
    onOpenChange,
    closeOnSelect = true,
  } = props;

  const { api, contentProps } = useCalendarMachine(props, {
    open,
    defaultOpen,
    closeOnSelect,
    onOpenChange: (details) => {
      onOpenChange?.(details.open);
    },
  });

  const displayLabel = getDisplayLabel(api.value, selectionMode, placeholder, formatValue);

  const defaultTrigger = (
    <Button
      variant="outline"
      width="full"
      justifyContent="space-between"
      disabled={disabled}
    >
      {displayLabel}
      <ChevronDownIcon />
    </Button>
  );

  return (
    <Parts.RootProvider value={api}>
      <Parts.Root width="100%">
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
      </Parts.Root>
    </Parts.RootProvider>
  );
};
