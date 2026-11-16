import type { ComponentProps } from "react";
import { describe, expectTypeOf, it } from "vitest";

import { Select, type SelectProps, type SelectRootProps, type SelectValue } from ".";
import type { SingleSelectionProps } from "../Listbox/types";

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

describe("selection mode props", () => {
  it("resolves Omit and Pick on one mode's props", () => {
    expectTypeOf<Omit<SelectProps<string, string>, "value">>().toHaveProperty("items");
    expectTypeOf<Omit<SelectProps<string, string, "multiple">, "value">>().toHaveProperty("items");
    expectTypeOf<Omit<SelectRootProps<string, string>, "value">>().toHaveProperty("items");
    expectTypeOf<Pick<SelectProps<string, string>, "color">>().toHaveProperty("color");
    expectTypeOf<Omit<ComponentProps<typeof Select.Root>, "value">>().toHaveProperty("items");
  });

  it("defaults to single mode", () => {
    expectTypeOf<SelectProps<string, string>["value"]>().toEqualTypeOf<string | null>();
    expectTypeOf<SelectProps<string, string, "multiple">["value"]>().toEqualTypeOf<
      readonly string[]
    >();
  });

  it("lets wrappers spread one mode's props through", () => {
    expectTypeOf(SingleSelectWrapper).toBeFunction();
  });
});
