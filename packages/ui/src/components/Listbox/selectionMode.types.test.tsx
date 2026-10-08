import type { ComponentProps } from "react";
import { describe, expectTypeOf, it } from "vitest";

import { type ListboxProps } from ".";
import {
  type DatePickerProps,
  type DatePickerSelectProps,
  type DateValue,
  DatePicker,
  type DatePickerSelect,
} from "../DatePicker";
import { Select, type SelectProps, type SelectRootProps, type SelectValue } from "../Select";
import type { SingleSelectionProps } from "./types";

type WrapperProps<T, V extends SelectValue> = Omit<
  SelectProps<T, V>,
  "selectionMode" | "value" | "onValueChange"
> &
  SingleSelectionProps<V> &
  ([T] extends [V] ? { allLabel?: string } : { allLabel?: never });

function SingleSelectWrapper<T, V extends SelectValue>({
  value,
  onValueChange,
  ...props
}: WrapperProps<T, V>) {
  return (
    <Select
      {...props}
      value={value}
      onValueChange={(next) => {
        const picked: V = next;
        onValueChange(picked);
      }}
    />
  );
}

function RangeDatePicker(props: DatePickerProps<"range">) {
  return <DatePicker {...props} />;
}

describe("selection mode props", () => {
  it("resolves Omit and Pick on one mode's props", () => {
    expectTypeOf<Omit<SelectProps<string, string>, "value">>().toHaveProperty("items");
    expectTypeOf<Omit<SelectProps<string, string, "multiple">, "value">>().toHaveProperty("items");
    expectTypeOf<Omit<SelectRootProps<string, string>, "value">>().toHaveProperty("items");
    expectTypeOf<Omit<ListboxProps<string, string>, "value">>().toHaveProperty("items");
    expectTypeOf<Omit<DatePickerProps, "value">>().toHaveProperty("onValueChange");
    expectTypeOf<Omit<DatePickerProps<"range">, "value">>().toHaveProperty("presets");
    expectTypeOf<Omit<DatePickerSelectProps<"multiple">, "value">>().toHaveProperty(
      "maxSelectedDates",
    );
    expectTypeOf<Pick<SelectProps<string, string>, "color">>().toHaveProperty("color");
    expectTypeOf<Omit<ComponentProps<typeof Select.Root>, "value">>().toHaveProperty("items");
    expectTypeOf<Omit<ComponentProps<typeof DatePicker>, "value">>().toHaveProperty(
      "onValueChange",
    );
    expectTypeOf<Omit<ComponentProps<typeof DatePickerSelect>, "value">>().toHaveProperty(
      "onValueChange",
    );
  });

  it("defaults to single mode", () => {
    expectTypeOf<SelectProps<string, string>["value"]>().toEqualTypeOf<string | null>();
    expectTypeOf<SelectProps<string, string, "multiple">["value"]>().toEqualTypeOf<
      readonly string[]
    >();
    expectTypeOf<DatePickerProps["value"]>().toEqualTypeOf<DateValue | undefined>();
    expectTypeOf<DatePickerProps<"range">["value"]>().toEqualTypeOf<DateValue[] | undefined>();
  });

  it("lets wrappers spread one mode's props through", () => {
    expectTypeOf(SingleSelectWrapper).toBeFunction();
    expectTypeOf(RangeDatePicker).toBeFunction();
  });
});
