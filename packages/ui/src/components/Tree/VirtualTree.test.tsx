import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { testAccessors, type TestNode } from "./tree.fixtures";
import { TreeView, type TreeViewActions } from "./TreeView";
import { VirtualTree, type VirtualTreeEntry, VirtualTreeRow } from "./VirtualTree";

const scrollArea = vi.hoisted(() => ({ props: {} as Record<string, unknown> }));

vi.mock("../ScrollArea/VirtualScrollArea", () => ({
  VirtualScrollArea: ({
    items,
    children,
    ...props
  }: {
    items: unknown[];
    children: (item: unknown, index: number) => React.ReactNode;
  }) => {
    scrollArea.props = props;
    return <>{items.map((item, index) => children(item, index))}</>;
  },
}));

const nodes: TestNode[] = [
  {
    id: "fruits",
    label: "Fruits",
    children: [
      { id: "apple", label: "Apple" },
      { id: "banana", label: "Banana" },
    ],
  },
  { id: "vegetables", label: "Vegetables", children: [{ id: "carrot", label: "Carrot" }] },
];

describe("VirtualTree", () => {
  it("scrolls to a row by its place among the shown rows, skipping collapsed branches", () => {
    render(
      <TreeView.Root
        nodes={nodes}
        {...testAccessors}
        expandedValue={["vegetables"]}
      >
        <TreeView.Tree>
          <VirtualTree rowHeight={32}>
            {({ node }: VirtualTreeEntry<TestNode>) => (
              <VirtualTreeRow>{node.label}</VirtualTreeRow>
            )}
          </VirtualTree>
        </TreeView.Tree>
      </TreeView.Root>,
    );
    const scrollToIndex = vi.fn();
    (scrollArea.props.scrollToIndexRef as { current: unknown }).current = scrollToIndex;

    fireEvent.keyDown(screen.getByText("Fruits"), { key: "End" });

    expect(scrollToIndex).toHaveBeenCalledWith(2);
  });

  it("announces a branch row's selected and checked state", () => {
    render(
      <TreeView.Root
        nodes={nodes}
        {...testAccessors}
        checkable
        selectedValue={["fruits"]}
        checkedValue={["apple", "banana"]}
      >
        <TreeView.Tree>
          <VirtualTree rowHeight={32}>
            {({ node }: VirtualTreeEntry<TestNode>) => (
              <VirtualTreeRow>{node.label}</VirtualTreeRow>
            )}
          </VirtualTree>
        </TreeView.Tree>
      </TreeView.Root>,
    );
    const fruits = screen.getByRole("treeitem", { name: "Fruits" });

    expect(fruits.getAttribute("aria-selected")).toBe("true");
    expect(fruits.getAttribute("aria-checked")).toBe("true");
  });

  it("scrolls to a row through actionsRef without moving focus", () => {
    const actions = createRef<TreeViewActions>();
    render(
      <TreeView.Root
        nodes={nodes}
        {...testAccessors}
        expandedValue={["vegetables"]}
        actionsRef={actions}
      >
        <TreeView.Tree>
          <VirtualTree rowHeight={32}>
            {({ node }: VirtualTreeEntry<TestNode>) => (
              <VirtualTreeRow>{node.label}</VirtualTreeRow>
            )}
          </VirtualTree>
        </TreeView.Tree>
      </TreeView.Root>,
    );
    const scrollToIndex = vi.fn();
    (scrollArea.props.scrollToIndexRef as { current: unknown }).current = scrollToIndex;

    act(() => actions.current?.scrollTo("carrot"));

    expect(scrollToIndex).toHaveBeenCalledWith(2);
    expect(document.activeElement).toBe(document.body);
  });
});
