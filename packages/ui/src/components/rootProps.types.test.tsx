import type { ComponentProps } from "react";
import { describe, expectTypeOf, it } from "vitest";

import type { Checkbox } from "./Checkbox";
import type { ColorPicker } from "./ColorPicker";
import { Combobox, type ComboboxRootProps } from "./Combobox";
import type { FileUpload } from "./FileUpload";
import type { HotkeyInput } from "./HotkeyInput";
import { Listbox, type ListboxRootProps } from "./Listbox";
import type { RatingGroup } from "./RatingGroup";
import type { ScrollArea } from "./ScrollArea";
import type { ApplySelect, Select } from "./Select";
import type { Table } from "./Table";
import { type TreeViewRootProps } from "./Tree";

type PartsWithoutRender<Namespace> = {
  [Key in keyof Namespace & string]: Key extends Capitalize<Key>
    ? Namespace[Key] extends (props: infer Props) => unknown
      ? "render" extends keyof Props
        ? never
        : Key
      : never
    : never;
}[keyof Namespace & string];

const letters = ["a", "b"];

function ComboboxValueChange() {
  return (
    <Combobox.Root
      items={letters}
      getItemValue={(item) => item}
      getItemLabel={(item) => item}
      size="sm"
      width="full"
      onValueChange={(value) => value?.toUpperCase()}
    />
  );
}

function ListboxValueChange() {
  return (
    <Listbox.Root
      items={letters}
      getItemValue={(item) => item}
      getItemLabel={(item) => item}
      width="full"
      value={null}
      onValueChange={(value) => value.toUpperCase()}
    />
  );
}

describe("root props", () => {
  it("keeps the root's own props over same-named div props", () => {
    expectTypeOf<ComboboxRootProps<string, string>["defaultValue"]>().toEqualTypeOf<
      string | null | undefined
    >();
    expectTypeOf<ListboxRootProps<string, string>>().not.toHaveProperty("defaultValue");
  });

  it("still takes style and variant props", () => {
    expectTypeOf<ComboboxRootProps>().toHaveProperty("width");
    expectTypeOf<ComboboxRootProps>().toHaveProperty("size");
    expectTypeOf<ListboxRootProps>().toHaveProperty("width");
    expectTypeOf<TreeViewRootProps>().toHaveProperty("width");
    expectTypeOf(ComboboxValueChange).toBeFunction();
    expectTypeOf(ListboxValueChange).toBeFunction();
  });

  it("gives every part that renders an element a render prop", () => {
    expectTypeOf<PartsWithoutRender<typeof Checkbox>>().toBeNever();
    expectTypeOf<PartsWithoutRender<typeof ColorPicker>>().toBeNever();
    expectTypeOf<PartsWithoutRender<typeof FileUpload>>().toBeNever();
    expectTypeOf<PartsWithoutRender<typeof RatingGroup>>().toBeNever();
    expectTypeOf<PartsWithoutRender<typeof ScrollArea>>().toBeNever();
    expectTypeOf<PartsWithoutRender<typeof Table>>().toBeNever();
    expectTypeOf<PartsWithoutRender<typeof Listbox>>().toEqualTypeOf<"EmptyState">();
    expectTypeOf<PartsWithoutRender<typeof Select>>().toEqualTypeOf<"Root">();
    expectTypeOf<PartsWithoutRender<typeof ApplySelect>>().toEqualTypeOf<"Root" | "Actions">();
    expectTypeOf<ComponentProps<typeof ScrollArea>>().toHaveProperty("render");
    expectTypeOf<ComponentProps<typeof HotkeyInput>>().toHaveProperty("render");
  });
});
