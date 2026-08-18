import { useDatePickerContext } from "@ark-ui/react/date-picker";
import { HStack } from "@construkt-kit/styled-system/jsx";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { Button, IconButton } from "../Buttons";
import { Text } from "../Text";
import * as Parts from "./parts";

type DatePickerApi = Parameters<
  NonNullable<ComponentProps<typeof Parts.ArkDatePicker.Context>["children"]>
>[0];

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

interface GridViewProps {
  view: "month" | "year";
  getGrid: (api: DatePickerApi) => { label: string; value: number }[][];
}

export const DatePickerGridView = ({ view, getGrid }: GridViewProps) => (
  <Parts.View view={view}>
    <Parts.ArkDatePicker.Context>
      {(api) => (
        <>
          <DatePickerViewControl />
          <Parts.Table>
            <Parts.TableBody>
              {getGrid(api).map((row, rowIndex) => (
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
        </>
      )}
    </Parts.ArkDatePicker.Context>
  </Parts.View>
);
