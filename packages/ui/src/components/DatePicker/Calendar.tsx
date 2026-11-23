import { useFieldFocusControl } from "../../primitives/field";
import { usePopup } from "../../primitives/popup";
import { CalendarContent } from "./CalendarContent";
import { CalendarProviders, calendarRootAttributes, useCalendarRoot } from "./calendarRoot";
import * as Parts from "./parts";
import type { CalendarMode, CalendarProps } from "./types";
import { focusedCell } from "./useCalendar";

export const Calendar = (props: CalendarProps<CalendarMode>) => {
  const popup = usePopup({ idPrefix: "picker", inline: true });
  const calendar = useCalendarRoot(props, popup);
  useFieldFocusControl(() => {
    if (popup.contentEl) focusedCell(popup.contentEl)?.focus();
  });

  return (
    <CalendarProviders
      popup={popup}
      calendar={calendar}
    >
      <Parts.Root
        variant="inline"
        {...calendarRootAttributes(calendar)}
      >
        <CalendarContent props={props} />
        {calendar.liveRegion}
      </Parts.Root>
    </CalendarProviders>
  );
};
