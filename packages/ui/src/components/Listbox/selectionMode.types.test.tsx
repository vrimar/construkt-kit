import { describe, expectTypeOf, it } from "vitest";

import { type ListboxProps } from ".";

describe("selection mode props", () => {
  it("resolves Omit on one mode's props", () => {
    expectTypeOf<Omit<ListboxProps<string, string>, "value">>().toHaveProperty("items");
    expectTypeOf<Omit<ListboxProps<string, string, "multiple">, "value">>().toHaveProperty("items");
  });

  it("defaults to single mode", () => {
    expectTypeOf<ListboxProps<string, string>["value"]>().toEqualTypeOf<string | null>();
    expectTypeOf<ListboxProps<string, string, "multiple">["value"]>().toEqualTypeOf<
      readonly string[]
    >();
  });
});
