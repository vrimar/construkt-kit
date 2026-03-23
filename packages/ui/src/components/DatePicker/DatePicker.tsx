import { DatePicker as ArkDatePicker, parseDate, useDatePicker } from "@ark-ui/react/date-picker";
import { Portal } from "@ark-ui/react/portal";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { HStack, styled } from "styled-system/jsx";
import { datePicker as datePickerRecipe } from "styled-system/recipes";
import { Button, IconButton } from "../Buttons";
import { Text } from "../Text";
import { DatePickerDayView } from "./DayView";

const classes = datePickerRecipe();

export interface DatePickerProps {
  trigger?: ReactNode;
  value?: Date;
  onValueChange: (value: Date | undefined) => unknown;
}

const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
        onValueChange(picked.toDate(localTimeZone));
      } else {
        onValueChange(undefined);
      }

      setIsOpened(false);
    },
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
      <styled.div
        className={classes.root}
        width="100%"
      >
        <ArkDatePicker.Control asChild>
          <ArkDatePicker.Trigger asChild>{trigger}</ArkDatePicker.Trigger>
        </ArkDatePicker.Control>

        <Portal disabled>
          <ArkDatePicker.Positioner>
            <ArkDatePicker.Content asChild>
              <styled.div className={classes.content}>
                <styled.div className={classes.viewControl}>
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
                </styled.div>

                <DatePickerDayView monthOffset={0} />
              </styled.div>
            </ArkDatePicker.Content>
          </ArkDatePicker.Positioner>
        </Portal>
      </styled.div>
    </ArkDatePicker.RootProvider>
  );
};
