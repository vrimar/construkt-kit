import type { DateValue } from "@ark-ui/react";
import { DatePicker as ArkDatePicker, parseDate, Portal, useDatePicker } from "@ark-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Box, HStack, Stack } from "styled-system/jsx";
import { Button, IconButton } from "../Buttons";
import { Separator } from "../Layout";
import { Text } from "../Text";

import { DatePickerDayView } from "./DayView";

export interface RangeDatePickerProps {
  trigger: React.ReactNode;
  mode?: "range" | "single" | "multiple";
  value: DateValue[];
  onValueChange: (value: DateValue[]) => unknown;
}

const presets = [
  { label: "Last 7 days", value: "last7Days" },
  { label: "Last 14 days", value: "last14Days" },
  { label: "Last 30 days", value: "last30Days" },
  { label: "Last 90 days", value: "last90Days" },
] as const;

export const RangeDatePicker = ({
  trigger,
  mode = "range",
  value,
  onValueChange,
}: RangeDatePickerProps) => {
  const [tempValue, setTempValue] = useState(value);
  const [isOpened, setIsOpened] = useState(false);
  const datePicker = useDatePicker({
    value: tempValue,
    selectionMode: mode,
    onValueChange: (props) => {
      setTempValue(props.value);

      if (props.value.length === 2) {
        onValueChange(props.value);
        setIsOpened(false);
      }
    },
    numOfMonths: 2,
    startOfWeek: 1,
    open: isOpened,
    onOpenChange: (props) => setIsOpened(props.open),
  });

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleClear = () => {
    setTempValue([]);
    onValueChange([]);
    setIsOpened(false);
  };

  return (
    <ArkDatePicker.RootProvider
      value={datePicker}
      asChild
    >
      <Box width="100%">
        <ArkDatePicker.Control asChild>
          <ArkDatePicker.Trigger asChild>{trigger}</ArkDatePicker.Trigger>
        </ArkDatePicker.Control>

        <Portal>
          <ArkDatePicker.Positioner>
            <ArkDatePicker.Content asChild>
              <HStack
                bg="bg"
                p="4"
                borderWidth="1px"
                borderColor="border"
                borderRadius="sm"
                alignItems="flex-start"
              >
                <Stack gap="0.5">
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    size="xs"
                  >
                    Clear
                  </Button>
                  {presets.map((preset) => (
                    <ArkDatePicker.PresetTrigger
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
                    </ArkDatePicker.PresetTrigger>
                  ))}
                </Stack>
                <Separator orientation="vertical" />
                <Stack>
                  <HStack justifyContent="space-between">
                    <HStack>
                      <ArkDatePicker.PrevTrigger asChild>
                        <IconButton
                          size="xs"
                          variant="plain"
                        >
                          <ChevronLeftIcon />
                        </IconButton>
                      </ArkDatePicker.PrevTrigger>
                      <Text fontWeight="bold">{datePicker.visibleRangeText.start}</Text>
                    </HStack>

                    <HStack>
                      <Text fontWeight="bold">{datePicker.visibleRangeText.end}</Text>
                      <ArkDatePicker.NextTrigger asChild>
                        <IconButton
                          size="xs"
                          variant="plain"
                        >
                          <ChevronRightIcon />
                        </IconButton>
                      </ArkDatePicker.NextTrigger>
                    </HStack>
                  </HStack>

                  <HStack
                    gap="5"
                    alignItems="flex-start"
                  >
                    <DatePickerDayView
                      key={0}
                      monthOffset={0}
                    />
                    <DatePickerDayView
                      key={1}
                      monthOffset={1}
                    />
                  </HStack>
                </Stack>
              </HStack>
            </ArkDatePicker.Content>
          </ArkDatePicker.Positioner>
        </Portal>
      </Box>
    </ArkDatePicker.RootProvider>
  );
};

export { parseDate };
export type { DateValue };
