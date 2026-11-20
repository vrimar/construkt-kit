import { Box } from "#styled-system/jsx";

import { Button } from "../Buttons";
import * as Parts from "./parts";
import { useCalendarContext } from "./useCalendar";

interface DayViewProps {
  monthOffset: number;
}

export const DatePickerDayView = ({ monthOffset }: DayViewProps) => {
  const calendar = useCalendarContext();

  return (
    <Parts.Table
      flex="1"
      {...calendar.getTableProps("day", 7)}
    >
      <Parts.TableHead aria-hidden>
        <Parts.TableRow {...calendar.getRowProps()}>
          {calendar.weekDays.map((weekDay, id) => (
            <Parts.TableHeader key={id}>
              <Box color="fg.subtle">{weekDay.short}</Box>
            </Parts.TableHeader>
          ))}
        </Parts.TableRow>
      </Parts.TableHead>
      <Parts.TableBody>
        {calendar.getMonths(monthOffset).map((week, weekIndex) => (
          <Parts.TableRow
            key={weekIndex}
            {...calendar.getRowProps()}
          >
            {week.map((day, dayIndex) => (
              <Parts.TableCell
                key={dayIndex}
                {...calendar.getDayCellProps(day)}
              >
                <Parts.TableCellTrigger
                  {...calendar.getDayTriggerProps(day)}
                  render={<Button />}
                >
                  {day.value.day}
                </Parts.TableCellTrigger>
              </Parts.TableCell>
            ))}
          </Parts.TableRow>
        ))}
      </Parts.TableBody>
    </Parts.Table>
  );
};
