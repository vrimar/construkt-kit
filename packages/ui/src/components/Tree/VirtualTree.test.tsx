import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createTestTree } from "./tree.fixtures";
import { useVirtualTreeView } from "./VirtualTree";

const collection = createTestTree([
  {
    id: "fruits",
    label: "Fruits",
    children: [
      { id: "apple", label: "Apple" },
      { id: "banana", label: "Banana" },
    ],
  },
  { id: "vegetables", label: "Vegetables", children: [{ id: "carrot", label: "Carrot" }] },
]);

describe("useVirtualTreeView", () => {
  it("scrolls to a value by its row among the shown rows, skipping collapsed branches", () => {
    const { result } = renderHook(() =>
      useVirtualTreeView({ collection, expandedValue: ["vegetables"] }),
    );
    const scroller = vi.fn();
    result.current.scrollToIndexRef.current = scroller;

    expect(result.current.scrollTo("carrot")).toBe(true);
    expect(scroller).toHaveBeenCalledWith(2);
    expect(result.current.scrollTo("apple")).toBe(false);
    expect(scroller).toHaveBeenCalledTimes(1);
  });
});
