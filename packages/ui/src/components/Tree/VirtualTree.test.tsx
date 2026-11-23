import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { virtualScrollAreaProps } from "../../_shared/virtualScrollAreaMock";
import { fruitVegNodes, testAccessors, type TestNode } from "./tree.fixtures";
import { TreeView, type TreeViewActions, type TreeViewRootProps } from "./TreeView";
import { VirtualTree, type VirtualTreeEntry, VirtualTreeRow } from "./VirtualTree";

vi.mock("../ScrollArea/VirtualScrollArea", () => import("../../_shared/virtualScrollAreaMock"));

const renderVirtualTree = (props: Partial<TreeViewRootProps<TestNode>> = {}) =>
  render(
    <TreeView.Root
      nodes={fruitVegNodes}
      {...testAccessors}
      {...props}
    >
      <TreeView.Tree>
        <VirtualTree rowHeight={32}>
          {({ node }: VirtualTreeEntry<TestNode>) => <VirtualTreeRow>{node.label}</VirtualTreeRow>}
        </VirtualTree>
      </TreeView.Tree>
    </TreeView.Root>,
  );

const mockScrollToIndex = () => {
  const scrollToIndex = vi.fn();
  (virtualScrollAreaProps.current.scrollToIndexRef as { current: unknown }).current = scrollToIndex;
  return scrollToIndex;
};

describe("VirtualTree", () => {
  it("renders the virtual scroll area with vertical scrollbars only", () => {
    renderVirtualTree();

    expect(virtualScrollAreaProps.current.scrollbars).toBe("vertical");
  });

  it("scrolls to a row by its place among the shown rows, skipping collapsed branches", () => {
    renderVirtualTree({ expandedValue: ["vegetables"] });
    const scrollToIndex = mockScrollToIndex();

    fireEvent.keyDown(screen.getByText("Fruits"), { key: "End" });

    expect(scrollToIndex).toHaveBeenCalledWith(2);
  });

  it("announces a branch row's selected and checked state", () => {
    renderVirtualTree({
      checkable: true,
      selectedValue: ["fruits"],
      checkedValue: ["apple", "banana"],
    });
    const fruits = screen.getByRole("treeitem", { name: "Fruits" });

    expect(fruits.getAttribute("aria-selected")).toBe("true");
    expect(fruits.getAttribute("aria-checked")).toBe("true");
  });

  it("scrolls to a row through actionsRef without moving focus", () => {
    const actions = createRef<TreeViewActions>();
    renderVirtualTree({ expandedValue: ["vegetables"], actionsRef: actions });
    const scrollToIndex = mockScrollToIndex();

    act(() => actions.current?.scrollTo("carrot"));

    expect(scrollToIndex).toHaveBeenCalledWith(2);
    expect(document.activeElement).toBe(document.body);
  });
});
