import { useDatePickerContext } from "@ark-ui/react/date-picker";
import { Box } from "@b3/styled-system/jsx";

import { Button } from "../Buttons";
import * as Parts from "./parts";

interface DayViewProps {
  monthOffset: number;
}

export const DatePickerDayView = (props: DayViewProps) => {
  const { monthOffset } = props;
  const datePicker = useDatePickerContext();
  const offset = datePicker.getOffset({ months: monthOffset });

  return (
    <Parts.Table flex="1">
      <Parts.TableHead>
        <Parts.TableRow>
          {datePicker.weekDays.map((weekDay, id) => (
            <Parts.TableHeader key={id}>
              <Box color="fg.subtle">{weekDay.short}</Box>
            </Parts.TableHeader>
          ))}
        </Parts.TableRow>
      </Parts.TableHead>
      <Parts.TableBody>
        {offset.weeks.map((week, weekIndex) => (
          <Parts.TableRow key={weekIndex}>
            {week.map((day, dayIndex) => (
              <Parts.TableCell
                key={dayIndex}
                value={day}
                visibleRange={offset.visibleRange}
              >
                <Parts.TableCellTrigger asChild>
                  <Button
                    size="xs"
                    variant="plain"
                    css={{
                      '[aria-selected="true"] &': {
                        bg: "colorPalette.subtle.bg",
                      },
                    }}
                  >
                    {day.day}
                  </Button>
                </Parts.TableCellTrigger>
              </Parts.TableCell>
            ))}
          </Parts.TableRow>
        ))}
      </Parts.TableBody>
    </Parts.Table>
  );
};
