import { useDatePickerContext } from "@ark-ui/react/date-picker";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { HStack } from "styled-system/jsx";

import { Button, IconButton } from "../Buttons";
import { Text } from "../Text";
import * as Parts from "./parts";

export const DatePickerYearView = () => {
  const datePicker = useDatePickerContext();

  return (
    <Parts.View view="year">
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
                {api.getYearsGrid({ columns: 4 }).map((years, yearsIndex) => (
                  <Parts.TableRow key={yearsIndex}>
                    {years.map((year, yearIndex) => (
                      <Parts.TableCell
                        key={yearIndex}
                        value={year.value}
                      >
                        <Parts.TableCellTrigger asChild>
                          <Button
                            size="xs"
                            variant="plain"
                          >
                            {year.label}
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
