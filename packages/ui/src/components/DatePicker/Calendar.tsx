import { useDatePicker } from "@ark-ui/react/date-picker";

import { CalendarContent } from "./CalendarContent";
import * as Parts from "./parts";
import type { CalendarProps } from "./types";
import { fireClear, fireValueChange, toArkDefaultValue, toArkValue } from "./types";

export const Calendar = (props: CalendarProps) => {
  const {
    selectionMode = "single",
    numOfMonths = selectionMode === "range" ? 2 : 1,
    startOfWeek = 1,
    locale,
    timeZone,
    fixedWeeks,
    min,
    max,
    isDateUnavailable,
    disabled,
    readOnly,
    defaultView,
    clearable,
  } = props;

  const presets = "presets" in props ? props.presets : undefined;
  const showPresets = "showPresets" in props ? props.showPresets : undefined;

  const datePicker = useDatePicker({
    value: toArkValue(props),
    defaultValue: toArkDefaultValue(props),
    selectionMode,
    numOfMonths,
    startOfWeek,
    locale,
    timeZone,
    fixedWeeks,
    min,
    max,
    isDateUnavailable,
    disabled,
    readOnly,
    defaultView,
    inline: true,
    onValueChange: (details) => fireValueChange(props, details.value),
  });

  return (
    <Parts.RootProvider
      value={datePicker}
      variant="inline"
    >
      <Parts.Root>
        <Parts.Content>
          <CalendarContent
            numOfMonths={numOfMonths}
            presets={presets}
            showPresets={showPresets}
            clearable={clearable}
            onClear={() => fireClear(props)}
          />
        </Parts.Content>
      </Parts.Root>
    </Parts.RootProvider>
  );
};
