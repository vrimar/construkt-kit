import { renderHook } from "@testing-library/react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import type { MultipleSelectionProps, SelectionMode, SingleSelectionProps } from "./types";
import { encodeSelectionValue, useSelectionController } from "./useSelectionController";

const items = [{ id: 1 }, { id: 2 }];

const renderController = (selectionMode: SelectionMode) => {
  const onValueChange = vi.fn();
  const itemProps = {
    items,
    getItemValue: (item: { id: number }) => item.id,
    getItemLabel: (item: { id: number }) => String(item.id),
  };
  const { result } = renderHook(() =>
    useSelectionController(
      selectionMode === "multiple"
        ? { ...itemProps, selectionMode, value: [1], onValueChange }
        : { ...itemProps, selectionMode, value: 1, onValueChange },
    ),
  );
  return { onListboxValueChange: result.current.onListboxValueChange, onValueChange };
};

describe("useSelectionController", () => {
  it("never emits an empty single selection", () => {
    const { onListboxValueChange, onValueChange } = renderController("single");

    onListboxValueChange({ value: [] });
    onListboxValueChange({ value: ["s:missing"] });
    expect(onValueChange).not.toHaveBeenCalled();

    onListboxValueChange({ value: [encodeSelectionValue(2)] });
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(2);
  });

  it("emits an empty multiple selection", () => {
    const { onListboxValueChange, onValueChange } = renderController("multiple");

    onListboxValueChange({ value: [] });
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith([]);
  });

  it("passes a custom filter the normalized query and skips a blank one", () => {
    const filter = vi.fn(() => true);
    const { rerender } = renderHook(
      ({ query }: { query: string }) =>
        useSelectionController({
          items,
          getItemValue: (item) => item.id,
          getItemLabel: (item) => String(item.id),
          selectionMode: "single",
          value: null,
          onValueChange: vi.fn(),
          search: { query, filter },
        }),
      { initialProps: { query: "   " } },
    );
    expect(filter).not.toHaveBeenCalled();

    rerender({ query: " AbC " });
    expect(filter).toHaveBeenCalledWith(items[0], "abc");
  });

  it("types the change handlers without a null single value", () => {
    expectTypeOf<SingleSelectionProps<number>["onValueChange"]>()
      .parameter(0)
      .toEqualTypeOf<number>();
    expectTypeOf<MultipleSelectionProps<number>["onValueChange"]>()
      .parameter(0)
      .toEqualTypeOf<number[]>();
  });
});
