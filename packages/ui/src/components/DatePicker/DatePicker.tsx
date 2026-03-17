import { DatePicker as ArkDatePicker, parseDate, Portal, useDatePicker } from "@ark-ui/react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Box, HStack, Stack } from "styled-system/jsx";
import { IconButton } from "../Buttons";
import { Text } from "../Text";

import { Button } from "../Buttons";
import { DatePickerDayView } from "./DayView";

export interface DatePickerProps {
  trigger?: React.ReactNode;
  value?: Date;
  onValueChange: (value: Date | undefined) => unknown;
}

export const DatePicker = ({ trigger, value, onValueChange }: DatePickerProps) => {
  const [tempValue, setTempValue] = useState(value ? [parseDate(value)] : []);

  const [isOpened, setIsOpened] = useState(false);

  const datePicker = useDatePicker({
    value: tempValue,
    selectionMode: "single",
    onValueChange: (props) => {
      setTempValue(props.value);

      const picked = props.value[0];
      if (picked) {
        onValueChange(picked.toDate(Intl.DateTimeFormat().resolvedOptions().timeZone));
      } else {
        onValueChange(undefined);
      }

      setIsOpened(false);
    },
    min: parseDate(new Date()),
    numOfMonths: 1,
    startOfWeek: 1,
    open: isOpened,
    onOpenChange: (props) => setIsOpened(props.open),
  });

  useEffect(() => {
    setTempValue(value ? [parseDate(value)] : []);
  }, [value]);

  trigger ??= (
    <Button
      variant="outline"
      width="full"
      justifyContent="space-between"
    >
      {value?.toDateString() ?? "Select Date"}
      <ChevronDownIcon />
    </Button>
  );

  return (
    <ArkDatePicker.RootProvider
      value={datePicker}
      asChild
    >
      <Box width="100%">
        <ArkDatePicker.Control asChild>
          <ArkDatePicker.Trigger asChild>{trigger}</ArkDatePicker.Trigger>
        </ArkDatePicker.Control>

        <Portal disabled>
          <ArkDatePicker.Positioner>
            <ArkDatePicker.Content asChild>
              <Stack
                bg="bg"
                p="4"
                borderWidth="1px"
                borderColor="border"
                borderRadius="sm"
                zIndex="9999"
              >
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

                  <ArkDatePicker.NextTrigger asChild>
                    <IconButton
                      size="xs"
                      variant="plain"
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  </ArkDatePicker.NextTrigger>
                </HStack>

                <DatePickerDayView monthOffset={0} />
              </Stack>
            </ArkDatePicker.Content>
          </ArkDatePicker.Positioner>
        </Portal>
      </Box>
    </ArkDatePicker.RootProvider>
  );
};
