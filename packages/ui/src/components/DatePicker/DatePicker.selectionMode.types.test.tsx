import type { ComponentProps } from "react";
import { describe, expectTypeOf, it } from "vitest";

import {
  type DatePickerProps,
  type DatePickerSelectProps,
  type DateValue,
  DatePicker,
  type DatePickerSelect,
} from ".";

function RangeDatePicker(props: DatePickerProps<"range">) {
  return <DatePicker {...props} />;
}

describe("selection mode props", () => {
  it("resolves Omit on one mode's props", () => {
    expectTypeOf<Omit<DatePickerProps, "value">>().toHaveProperty("onValueChange");
    expectTypeOf<Omit<DatePickerProps<"range">, "value">>().toHaveProperty("presets");
    expectTypeOf<Omit<DatePickerSelectProps<"multiple">, "value">>().toHaveProperty(
      "maxSelectedDates",
    );
    expectTypeOf<Omit<ComponentProps<typeof DatePicker>, "value">>().toHaveProperty(
      "onValueChange",
    );
    expectTypeOf<Omit<ComponentProps<typeof DatePickerSelect>, "value">>().toHaveProperty(
      "onValueChange",
    );
  });

  it("defaults to single mode", () => {
    expectTypeOf<DatePickerProps["value"]>().toEqualTypeOf<DateValue | undefined>();
    expectTypeOf<DatePickerProps<"range">["value"]>().toEqualTypeOf<DateValue[] | undefined>();
  });

  it("lets wrappers spread one mode's props through", () => {
    expectTypeOf(RangeDatePicker).toBeFunction();
  });
});
