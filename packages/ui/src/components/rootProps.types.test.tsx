import { describe, expectTypeOf, it } from "vitest";

import { Combobox, type ComboboxRootProps } from "./Combobox";
import { createListCollection, Listbox, type ListboxRootProps } from "./Listbox";
import { type TreeViewRootProps } from "./Tree";

type SelectDetails<P> = P extends { onSelect?: (details: infer D) => void } ? D : never;

const collection = createListCollection({ items: ["a", "b"] });

function ComboboxOnSelect() {
  return (
    <Combobox.Root
      collection={collection}
      size="sm"
      width="full"
      onSelect={({ itemValue }) => itemValue}
    />
  );
}

function ListboxOnSelect() {
  return (
    <Listbox.Root
      collection={collection}
      width="full"
      onSelect={({ value }) => value}
    />
  );
}

describe("Ark root props", () => {
  it("keeps the root's own props over same-named div props", () => {
    expectTypeOf<SelectDetails<ComboboxRootProps>>().toHaveProperty("itemValue");
    expectTypeOf<ComboboxRootProps["defaultValue"]>().toEqualTypeOf<string[] | undefined>();
    expectTypeOf<SelectDetails<ListboxRootProps>>().toHaveProperty("value");
    expectTypeOf<ListboxRootProps["defaultValue"]>().toEqualTypeOf<string[] | undefined>();
  });

  it("still takes style and variant props", () => {
    expectTypeOf<ComboboxRootProps>().toHaveProperty("width");
    expectTypeOf<ComboboxRootProps>().toHaveProperty("size");
    expectTypeOf<ListboxRootProps>().toHaveProperty("width");
    expectTypeOf<TreeViewRootProps>().toHaveProperty("width");
    expectTypeOf(ComboboxOnSelect).toBeFunction();
    expectTypeOf(ListboxOnSelect).toBeFunction();
  });
});
