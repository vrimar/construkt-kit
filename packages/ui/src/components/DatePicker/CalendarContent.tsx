import { useDatePickerContext } from "@ark-ui/react/date-picker";

import { Box, Divider, HStack, Stack } from "#styled-system/jsx";

import { Button } from "../Buttons";
import { DatePickerDayView } from "./DayView";
import { DatePickerGridView, DatePickerViewControl } from "./GridView";
import * as Parts from "./parts";
import type { RangePreset } from "./types";

interface CalendarContentProps {
  isMobile: boolean;
  presets?: RangePreset[];
  showPresets?: boolean;
  clearable?: boolean;
  clearLabel?: string;
}

export const CalendarContent = ({
  isMobile,
  presets,
  showPresets = true,
  clearable,
  clearLabel = "Clear",
}: CalendarContentProps) => {
  const { numOfMonths, clearValue } = useDatePickerContext();
  const hasPresets = showPresets && presets && presets.length > 0;
  const clearButton = clearable && (
    <Button
      variant="outline"
      colorPalette="neutral"
      onClick={() => clearValue()}
      size="xs"
      width={hasPresets ? undefined : "full"}
    >
      {clearLabel}
    </Button>
  );

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
            {clearButton}
            {presets.map((preset) => (
              <Parts.PresetTrigger
                key={preset.value}
                value={preset.value}
                asChild
              >
                <Button
                  size="xs"
                  variant="plain"
                  colorPalette="neutral"
                >
                  {preset.label}
                </Button>
              </Parts.PresetTrigger>
            ))}
          </Stack>
          <Divider
            orientation={isMobile ? "horizontal" : "vertical"}
            alignSelf="stretch"
            height="auto"
          />
        </>
      )}
      <Stack
        gap="3"
        flex="1"
      >
        <Parts.View view="day">
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
        </Parts.View>

        <DatePickerGridView view="month" />
        <DatePickerGridView view="year" />

        {!hasPresets && clearButton}
      </Stack>
    </Box>
  );
};
