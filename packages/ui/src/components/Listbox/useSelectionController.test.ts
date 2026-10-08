import { renderHook } from "@testing-library/react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import type { MultipleSelectionProps, SingleSelectionProps } from "./types";
import { encodeSelectionValue, useSelectionController } from "./useSelectionController";

const items = [{ id: 1 }, { id: 2 }];

const renderController = (selectionMode: "single" | "multiple") => {
  const onValueChange = vi.fn();
  const { result } = renderHook(() =>
    useSelectionController({
      items,
      getItemValue: (item) => item.id,
      getItemLabel: (item) => String(item.id),
      selectionMode,
      value: selectionMode === "multiple" ? [1] : 1,
      onValueChange,
    }),
  );
  return { handleValueChange: result.current.handleValueChange, onValueChange };
};

describe("useSelectionController", () => {
  it("never emits an empty single selection", () => {
    const { handleValueChange, onValueChange } = renderController("single");

    handleValueChange({ value: [] });
    handleValueChange({ value: ["s:missing"] });
    expect(onValueChange).not.toHaveBeenCalled();

    handleValueChange({ value: [encodeSelectionValue(2)] });
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(2);
  });

  it("emits an empty multiple selection", () => {
    const { handleValueChange, onValueChange } = renderController("multiple");

    handleValueChange({ value: [] });
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
