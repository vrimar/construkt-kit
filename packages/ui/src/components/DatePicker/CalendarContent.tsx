import { HStack, Stack } from "@construkt-kit/styled-system/jsx";

import { useIsMobile } from "../../hooks";
import { Button } from "../Buttons";
import { Box, Separator } from "../Layout";
import { DatePickerDayView } from "./DayView";
import { DatePickerViewControl } from "./GridView";
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
  const hasPresets = showPresets && presets && presets.length > 0;
  const isMobile = useIsMobile();

  return (
    <Box
      display="flex"
      flexDirection={isMobile ? "column" : "row"}
      alignItems={isMobile ? "stretch" : "flex-start"}
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
          <Separator orientation={isMobile ? "horizontal" : "vertical"} />
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
                <DatePickerViewControl endLabel={numOfMonths > 1} />

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
