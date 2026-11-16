import { useDatePickerContext } from "@ark-ui/react/date-picker";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { HStack } from "#styled-system/jsx";

import { Button, IconButton } from "../Buttons";
import * as Parts from "./parts";

const viewTrigger = (text: string) => (
  <Parts.ViewTrigger asChild>
    <Button fontWeight="bold">{text}</Button>
  </Parts.ViewTrigger>
);

export const DatePickerViewControl = ({ endLabel }: { endLabel?: boolean }) => {
  const datePicker = useDatePickerContext();

  return (
    <Parts.ViewControl>
      <HStack>
        <Parts.PrevTrigger asChild>
          <IconButton>
            <ChevronLeftIcon />
          </IconButton>
        </Parts.PrevTrigger>
        {viewTrigger(datePicker.visibleRangeText.start)}
      </HStack>

      {endLabel && viewTrigger(datePicker.visibleRangeText.end)}

      <Parts.NextTrigger asChild>
        <IconButton>
          <ChevronRightIcon />
        </IconButton>
      </Parts.NextTrigger>
    </Parts.ViewControl>
  );
};

export const DatePickerGridView = ({ view }: { view: "month" | "year" }) => {
  const datePicker = useDatePickerContext();
  const grid =
    view === "month"
      ? datePicker.getMonthsGrid({ columns: 4, format: "short" })
      : datePicker.getYearsGrid({ columns: 4 });

  return (
    <Parts.View view={view}>
      <DatePickerViewControl />
      <Parts.Table>
        <Parts.TableBody>
          {grid.map((row, rowIndex) => (
            <Parts.TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <Parts.TableCell
                  key={cellIndex}
                  value={cell.value}
                >
                  <Parts.TableCellTrigger asChild>
                    <Button>{cell.label}</Button>
                  </Parts.TableCellTrigger>
                </Parts.TableCell>
              ))}
            </Parts.TableRow>
          ))}
        </Parts.TableBody>
      </Parts.Table>
    </Parts.View>
  );
};
