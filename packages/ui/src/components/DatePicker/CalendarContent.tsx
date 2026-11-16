import { useDatePickerContext } from "@ark-ui/react/date-picker";

import { Box, Divider, HStack, Stack } from "#styled-system/jsx";

import { useIsMobile } from "../../hooks";
import { Button } from "../Buttons";
import { type ButtonGroupContextProps, ButtonPropsProvider } from "../Buttons/buttonPropsContext";
import { DatePickerDayView } from "./DayView";
import { DatePickerGridView, DatePickerViewControl } from "./GridView";
import * as Parts from "./parts";
import type { RangePreset } from "./types";

const calendarButtonProps: ButtonGroupContextProps = {
  size: "xs",
  variant: "plain",
  colorPalette: "neutral",
};

interface CalendarContentProps {
  presets?: RangePreset[];
  showPresets?: boolean;
  clearable?: boolean;
  clearLabel?: string;
}

export const CalendarContent = ({
  presets,
  showPresets = true,
  clearable,
  clearLabel = "Clear",
}: CalendarContentProps) => {
  const { numOfMonths, readOnly, disabled, clearValue } = useDatePickerContext();
  const isMobile = useIsMobile();
  // zag ignores clear and preset clicks while read-only or disabled but leaves them looking live.
  const hasPresets = showPresets && !readOnly && presets && presets.length > 0;
  const clearButton = clearable && !readOnly && (
    <Parts.ClearTrigger asChild>
      <Button
        variant="outline"
        disabled={disabled}
        width={hasPresets ? undefined : "full"}
        onClickCapture={(event) => {
          // zag would focus the trigger or input, which lie outside an open calendar.
          event.preventDefault();
          const calendar = event.currentTarget.closest(
            "[data-scope=date-picker][data-part=content]",
          );
          clearValue({ focus: false });
          requestAnimationFrame(() => {
            calendar
              ?.querySelector<HTMLElement>("[data-part=table-cell-trigger][data-focus]")
              ?.focus();
          });
        }}
      >
        {clearLabel}
      </Button>
    </Parts.ClearTrigger>
  );

  return (
    <ButtonPropsProvider value={calendarButtonProps}>
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
                  <Button disabled={disabled}>{preset.label}</Button>
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
    </ButtonPropsProvider>
  );
};
