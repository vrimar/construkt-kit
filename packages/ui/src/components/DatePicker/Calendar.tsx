import { CalendarContent } from "./CalendarContent";
import * as Parts from "./parts";
import type { CalendarMode, CalendarProps } from "./types";
import { useCalendarMachine } from "./useCalendarMachine";

export const Calendar = (props: CalendarProps<CalendarMode>) => {
  const { api, contentProps } = useCalendarMachine(props, { inline: true });

  return (
    <Parts.RootProvider
      value={api}
      variant="inline"
    >
      <Parts.Content>
        <CalendarContent {...contentProps} />
      </Parts.Content>
    </Parts.RootProvider>
  );
};
