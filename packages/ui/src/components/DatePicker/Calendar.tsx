import { CalendarContent } from "./CalendarContent";
import * as Parts from "./parts";
import type { CalendarProps } from "./types";
import { useCalendarMachine } from "./useCalendarMachine";

export const Calendar = (props: CalendarProps) => {
  const { api, contentProps } = useCalendarMachine(props, { inline: true });

  return (
    <Parts.RootProvider
      value={api}
      variant="inline"
    >
      <Parts.Root>
        <Parts.Content>
          <CalendarContent {...contentProps} />
        </Parts.Content>
      </Parts.Root>
    </Parts.RootProvider>
  );
};
