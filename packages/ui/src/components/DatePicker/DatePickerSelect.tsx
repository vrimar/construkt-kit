import { useMemo } from "react";

import { SelectButton } from "../Buttons/SelectButton";
import type { RangeDatePickerProps } from "./RangeDatePicker";
import { RangeDatePicker } from "./RangeDatePicker";

interface Props extends Omit<RangeDatePickerProps, "trigger"> {}

export const DatePickerSelect = (props: Props) => {
  const label = useMemo(() => {
    return props.value.map((date) => `${date.year}-${date.month}-${date.day}`).join(" to ");
  }, [props.value]);

  const hasValue = props.value.length === 2;

  const handleClear = () => {
    props.onValueChange([]);
  };

  return (
    <RangeDatePicker
      {...props}
      trigger={
        <SelectButton
          hasValue={hasValue}
          onClear={handleClear}
          label={label || "Select date"}
          variant="ghost"
          width="100%"
          size="sm"
        />
      }
    />
  );
};
