import { DatePicker, useDatePickerContext } from "@ark-ui/react/date-picker";
import { Box } from "styled-system/jsx";
import { Button } from "../Buttons";

interface DayViewProps {
  monthOffset: number;
}

export const DatePickerDayView = (props: DayViewProps) => {
  const { monthOffset } = props;
  const datePicker = useDatePickerContext();
  const offset = datePicker.getOffset({ months: monthOffset });

  return (
    <DatePicker.Table>
      <DatePicker.TableHead>
        <DatePicker.TableRow>
          {datePicker.weekDays.map((weekDay, id) => (
            <DatePicker.TableHeader key={id}>
              <Box color="fg.subtle">{weekDay.short}</Box>
            </DatePicker.TableHeader>
          ))}
        </DatePicker.TableRow>
      </DatePicker.TableHead>
      <DatePicker.TableBody>
        {offset.weeks.map((week, id) => (
          <DatePicker.TableRow key={id}>
            {week.map((day, id) => (
              <DatePicker.TableCell
                key={id}
                value={day}
                visibleRange={offset.visibleRange}
              >
                <DatePicker.TableCellTrigger asChild>
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
                </DatePicker.TableCellTrigger>
              </DatePicker.TableCell>
            ))}
          </DatePicker.TableRow>
        ))}
      </DatePicker.TableBody>
    </DatePicker.Table>
  );
};
