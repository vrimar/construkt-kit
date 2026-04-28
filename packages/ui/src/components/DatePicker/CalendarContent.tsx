import { useDatePickerContext } from "@ark-ui/react/date-picker";
import { HStack, Stack } from "@construkt-kit/styled-system/jsx";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button, IconButton } from "../Buttons";
import { Box, Separator } from "../Layout";
import { Text } from "../Text";
import { DatePickerDayView } from "./DayView";
import { DatePickerMonthView } from "./MonthView";
import * as Parts from "./parts";
import type { RangePreset } from "./types";
import { DatePickerYearView } from "./YearView";

interface CalendarContentProps {
  numOfMonths: number;
  presets?: RangePreset[];
  showPresets?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

export const CalendarContent = ({
  numOfMonths,
  presets,
  showPresets = true,
  clearable,
  onClear,
}: CalendarContentProps) => {
  const datePicker = useDatePickerContext();
  const hasPresets = showPresets && presets && presets.length > 0;

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="flex-start"
      gap="3"
    >
      {hasPresets && (
        <>
          <Stack gap="0.5">
            {clearable && (
              <Button
                variant="outline"
                onClick={onClear}
                size="xs"
              >
                Clear
              </Button>
            )}
            {presets.map((preset) => (
              <Parts.PresetTrigger
                key={preset.value}
                value={preset.value}
                asChild
              >
                <Button
                  size="xs"
                  variant="plain"
                >
                  {preset.label}
                </Button>
              </Parts.PresetTrigger>
            ))}
          </Stack>
          <Separator orientation="vertical" />
        </>
      )}
      <Stack
        gap="3"
        flex="1"
      >
        <Parts.View view="day">
          <Parts.ArkDatePicker.Context>
            {() => (
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

                  {numOfMonths > 1 && (
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

                <HStack
                  gap="5"
                  alignItems="flex-start"
                >
                  {Array.from({ length: numOfMonths }, (_, i) => (
                    <DatePickerDayView
                      key={i}
                      monthOffset={i}
                    />
                  ))}
                </HStack>
              </>
            )}
          </Parts.ArkDatePicker.Context>
        </Parts.View>

        <DatePickerMonthView />
        <DatePickerYearView />

        {!hasPresets && clearable && (
          <Button
            variant="outline"
            onClick={onClear}
            size="xs"
            width="full"
          >
            Clear
          </Button>
        )}
      </Stack>
    </Box>
  );
};
