import { Box, Divider, HStack, Stack } from "#styled-system/jsx";

import { useIsMobile } from "../../hooks";
import { Button } from "../Buttons";
import { type ButtonGroupContextProps, ButtonPropsProvider } from "../Buttons/buttonPropsContext";
import { DatePickerDayView } from "./DayView";
import { DatePickerGridView, DatePickerViewControl } from "./GridView";
import * as Parts from "./parts";
import type { RangePreset } from "./types";
import { useCalendarContext } from "./useCalendar";

const calendarButtonProps: ButtonGroupContextProps = {
  size: "xs",
  variant: "plain",
  colorPalette: "neutral",
};

interface CalendarContentProps {
  presets?: RangePreset[] | undefined;
  showPresets?: boolean | undefined;
  clearable?: boolean | undefined;
  clearLabel?: string | undefined;
}

export const CalendarContent = ({
  presets,
  showPresets = true,
  clearable,
  clearLabel = "Clear",
}: CalendarContentProps) => {
  const calendar = useCalendarContext();
  const { numOfMonths, readOnly, disabled, view } = calendar;
  const isMobile = useIsMobile();
  const hasPresets = showPresets && !readOnly && presets && presets.length > 0;
  const clearButton = clearable && !readOnly && (
    <Parts.ClearTrigger
      type="button"
      hidden={calendar.value.length === 0}
      onClick={(event) => {
        if (!event.defaultPrevented && calendar.interactive) {
          calendar.clear(event.nativeEvent, { focusCell: true });
        }
      }}
      render={
        <Button
          variant="outline"
          disabled={disabled}
          width={hasPresets ? undefined : "full"}
        />
      }
    >
      {clearLabel}
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
                  type="button"
                  onClick={(event) => {
                    if (!event.defaultPrevented) {
                      calendar.selectPreset(preset.value, event.nativeEvent);
                    }
                  }}
                  render={<Button disabled={disabled} />}
                >
                  {preset.label}
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
          {view === "day" && (
            <Parts.View data-view="day">
              <DatePickerViewControl
                view="day"
                endLabel={numOfMonths > 1}
              />

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
          )}

          {view === "month" && <DatePickerGridView view="month" />}
          {view === "year" && <DatePickerGridView view="year" />}

          {!hasPresets && clearButton}
        </Stack>
      </Box>
    </ButtonPropsProvider>
  );
};
