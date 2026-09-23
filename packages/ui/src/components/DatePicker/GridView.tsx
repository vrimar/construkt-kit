import { useDatePickerContext } from "@ark-ui/react/date-picker";
import { HStack } from "@construkt-kit/styled-system/jsx";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button, IconButton } from "../Buttons";
import { Text } from "../Text";
import * as Parts from "./parts";

export const DatePickerViewControl = ({ endLabel }: { endLabel?: boolean }) => {
  const datePicker = useDatePickerContext();

  return (
    <Parts.ViewControl>
      <HStack>
        <Parts.PrevTrigger asChild>
          <IconButton
            size="xs"
            variant="plain"
          >
            <ChevronLeftIcon />
          </IconButton>
        </Parts.PrevTrigger>
        <Parts.ViewTrigger asChild>
          <Button
            size="xs"
            variant="plain"
          >
            <Text fontWeight="bold">{datePicker.visibleRangeText.start}</Text>
          </Button>
        </Parts.ViewTrigger>
      </HStack>

      {endLabel && (
        <Parts.ViewTrigger asChild>
          <Button
            size="xs"
            variant="plain"
          >
            <Text fontWeight="bold">{datePicker.visibleRangeText.end}</Text>
          </Button>
        </Parts.ViewTrigger>
      )}

      <Parts.NextTrigger asChild>
        <IconButton
          size="xs"
          variant="plain"
        >
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
                    <Button
                      size="xs"
                      variant="plain"
                    >
                      {cell.label}
                    </Button>
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
