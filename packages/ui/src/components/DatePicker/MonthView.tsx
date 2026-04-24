import { useDatePickerContext } from "@ark-ui/react/date-picker";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { HStack } from "@b3/styled-system/jsx";

import { Button, IconButton } from "../Buttons";
import { Text } from "../Text";
import * as Parts from "./parts";

export const DatePickerMonthView = () => {
  const datePicker = useDatePickerContext();

  return (
    <Parts.View view="month">
      <Parts.ArkDatePicker.Context>
        {(api) => (
          <>
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
              <Parts.NextTrigger asChild>
                <IconButton
                  size="xs"
                  variant="plain"
                >
                  <ChevronRightIcon />
                </IconButton>
              </Parts.NextTrigger>
            </Parts.ViewControl>
            <Parts.Table>
              <Parts.TableBody>
                {api.getMonthsGrid({ columns: 4, format: "short" }).map((months, rowIndex) => (
                  <Parts.TableRow key={rowIndex}>
                    {months.map((month, monthIndex) => (
                      <Parts.TableCell
                        key={monthIndex}
                        value={month.value}
                      >
                        <Parts.TableCellTrigger asChild>
                          <Button
                            size="xs"
                            variant="plain"
                          >
                            {month.label}
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
};
