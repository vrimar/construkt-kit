import { usePickerPopup } from "../pickerPopup";
import {
  CalendarBody,
  CalendarProviders,
  calendarRootAttributes,
  useCalendarRoot,
} from "./calendarRoot";
import * as Parts from "./parts";
import type { CalendarMode, CalendarProps } from "./types";

export const Calendar = (props: CalendarProps<CalendarMode>) => {
  const popup = usePickerPopup({ inline: true });
  const calendar = useCalendarRoot(props, popup);

  return (
    <CalendarProviders
      popup={popup}
      calendar={calendar}
    >
      <Parts.Root
        variant="inline"
        {...calendarRootAttributes(calendar)}
      >
        <CalendarBody props={props} />
        {calendar.liveRegion}
      </Parts.Root>
    </CalendarProviders>
  );
};
