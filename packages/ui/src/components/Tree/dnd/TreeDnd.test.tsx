import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import { DraggableTreeNode } from "../DraggableTreeNode";
import { childIdsOf, fruitVegNodes, testAccessors, type TestNode } from "../tree.fixtures";
import { TreeView, type TreeViewRootProps } from "../TreeView";
import { TreeViewDndProvider, type TreeViewDndProviderProps } from "./TreeDndContext";

type DndTreeProps = Partial<TreeViewDndProviderProps<TestNode>> &
  Pick<TreeViewRootProps<TestNode>, "loadChildren"> & {
    nodes?: TestNode[];
    defaultExpandedValue?: string[];
    onExpandedChange?: (value: string[]) => void;
  };

function DndTree({
  nodes = fruitVegNodes,
  defaultExpandedValue = ["fruits", "vegetables"],
  onExpandedChange,
  loadChildren,
  onNodesChange = () => {},
  ...dnd
}: DndTreeProps) {
  return (
    <TreeView.Root
      nodes={nodes}
      {...testAccessors}
      defaultExpandedValue={defaultExpandedValue}
      onExpandedChange={onExpandedChange}
      loadChildren={loadChildren}
    >
      <TreeViewDndProvider
        {...dnd}
        onNodesChange={onNodesChange}
      >
        <TreeView.Tree>
          {nodes.map((node, index) => (
            <DraggableTreeNode
              key={node.id}
              node={node}
              indexPath={[index]}
            />
          ))}
        </TreeView.Tree>
      </TreeViewDndProvider>
    </TreeView.Root>
  );
}

const rowOf = (label: string) =>
  screen
    .getByText(label)
    .closest<HTMLElement>('[data-slot="branchControl"], [data-slot="item"]') as HTMLElement;

const draggableOf = (label: string) =>
  screen.getByText(label).closest<HTMLElement>("[draggable='true']") as HTMLElement;

const flush = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

describe("TreeViewDndProvider keyboard moves", () => {
  it("reorders a node with Ctrl+ArrowDown and commits the change", () => {
    const onNodesChange = vi.fn();
    render(<DndTree onNodesChange={onNodesChange} />);

    fireEvent.keyDown(draggableOf("Apple"), { key: "ArrowDown", ctrlKey: true });

    expect(onNodesChange).toHaveBeenCalledTimes(1);
    const next = onNodesChange.mock.calls[0][0] as TestNode[];
    expect(childIdsOf(next, "fruits")).toEqual(["banana", "apple"]);
  });

  it.each([
    ["canDrop", { canDrop: () => false }, "Apple", "ArrowDown"],
    ["blockReparent", { blockReparent: true }, "Carrot", "ArrowLeft"],
    ["isNodeDraggable", { isNodeDraggable: () => false }, "Apple", "ArrowDown"],
    [
      "disabled node",
      {
        nodes: [
          {
            id: "fruits",
            label: "Fruits",
            children: [
              { id: "apple", label: "Apple", disabled: true },
              { id: "banana", label: "Banana" },
            ],
          },
        ],
      },
      "Apple",
      "ArrowDown",
    ],
  ] satisfies [string, DndTreeProps, string, string][])(
    "respects the %s veto",
    (_, veto, label, key) => {
      const onNodesChange = vi.fn();
      render(
        <DndTree
          onNodesChange={onNodesChange}
          {...veto}
        />,
      );

      fireEvent.keyDown(draggableOf(label), { key, ctrlKey: true });

      expect(onNodesChange).not.toHaveBeenCalled();
    },
  );

  it("moves every getDragValues node, as a pointer drag does", () => {
    const onNodesChange = vi.fn();
    render(
      <DndTree
        onNodesChange={onNodesChange}
        getDragValues={(value) => (value === "apple" ? ["apple", "carrot"] : [value])}
      />,
    );

    fireEvent.keyDown(draggableOf("Apple"), { key: "ArrowDown", ctrlKey: true });

    expect(onNodesChange).toHaveBeenCalledTimes(1);
    const next = onNodesChange.mock.calls[0][0] as TestNode[];
    expect(childIdsOf(next, "fruits")).toEqual(["banana", "apple", "carrot"]);
    expect(childIdsOf(next, "vegetables")).toEqual([]);
  });

  it("leaves locked nodes out of a multi-node move", () => {
    const onNodesChange = vi.fn();
    render(
      <DndTree
        onNodesChange={onNodesChange}
        getDragValues={(value) => (value === "apple" ? ["apple", "carrot"] : [value])}
        isNodeDraggable={(node) => node.id !== "carrot"}
      />,
    );

    fireEvent.keyDown(rowOf("Apple"), { key: "ArrowDown", ctrlKey: true });

    const next = onNodesChange.mock.calls[0][0] as TestNode[];
    expect(childIdsOf(next, "fruits")).toEqual(["banana", "apple"]);
    expect(childIdsOf(next, "vegetables")).toEqual(["carrot"]);
  });

  it("expands a collapsed branch on indent and keeps focus on the moved node", async () => {
    const onExpandedChange = vi.fn();
    const ReorderableTree = () => {
      const [nodes, setNodes] = useState(fruitVegNodes);
      return (
        <DndTree
          nodes={nodes}
          onNodesChange={setNodes}
          defaultExpandedValue={[]}
          onExpandedChange={onExpandedChange}
        />
      );
    };
    render(<ReorderableTree />);
    const vegetables = draggableOf("Vegetables");
    vegetables.focus();

    // Flushes the microtask-deferred expansion before the refocus frame, as a real keypress does.
    await act(async () => {
      fireEvent.keyDown(vegetables, { key: "ArrowRight", ctrlKey: true });
    });

    expect(onExpandedChange).toHaveBeenLastCalledWith(["fruits"], expect.anything());
    const moved = draggableOf("Vegetables");
    expect(moved.getAttribute("data-depth")).toBe("2");
    await waitFor(() => expect(document.activeElement).toBe(moved));
  });

  it("won't nest into an expanded branch whose children haven't loaded", () => {
    const onNodesChange = vi.fn();
    render(
      <DndTree
        nodes={[
          { id: "fruits", label: "Fruits", childrenCount: 2 },
          { id: "pear", label: "Pear" },
        ]}
        defaultExpandedValue={["fruits"]}
        loadChildren={() => new Promise(() => {})}
        onNodesChange={onNodesChange}
      />,
    );

    fireEvent.keyDown(draggableOf("Pear"), { key: "ArrowRight", ctrlKey: true });

    expect(onNodesChange).not.toHaveBeenCalled();
  });

  it("renders an assistive-tech live region", () => {
    const { container } = render(<DndTree />);

    expect(container.querySelector("[aria-live]")).not.toBeNull();
  });
});

const pearNodes: TestNode[] = [
  {
    id: "fruits",
    label: "Fruits",
    children: [
      { id: "apple", label: "Apple" },
      { id: "banana", label: "Banana" },
    ],
  },
  { id: "pear", label: "Pear" },
];

const pointerDrag = (
  source: HTMLElement,
  target: HTMLElement,
  clientX: number,
  clientY: number,
) => {
  const dataTransfer = {
    types: [] as string[],
    dropEffect: "none",
    effectAllowed: "all",
    setData: () => {},
    getData: () => "",
    clearData: () => {},
    setDragImage: () => {},
  };
  const init = { dataTransfer, clientX, clientY };
  fireEvent.dragStart(source, init);
  fireEvent.dragEnter(target, init);
  fireEvent.dragOver(target, init);
  fireEvent.drop(target, init);
};

describe("TreeViewDndProvider pointer drops", () => {
  const view = document.defaultView as Window & typeof globalThis;
  view.DragEvent ??= class DragEvent extends view.MouseEvent {} as typeof view.DragEvent;

  const mockRowRects = () => {
    const rect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue(DOMRect.fromRect({ x: 0, y: 0, width: 200, height: 20 }));
    onTestFinished(() => rect.mockRestore());
  };

  it("nests a dropped node into a collapsed branch and reveals it", async () => {
    mockRowRects();
    const onNodesChange = vi.fn();
    const onExpandedChange = vi.fn();
    render(
      <DndTree
        nodes={pearNodes}
        defaultExpandedValue={[]}
        onNodesChange={onNodesChange}
        onExpandedChange={onExpandedChange}
      />,
    );

    pointerDrag(rowOf("Pear"), rowOf("Fruits"), 100, 10);
    await flush();

    const next = onNodesChange.mock.calls[0][0] as TestNode[];
    expect(childIdsOf(next, "fruits")).toEqual(["pear", "apple", "banana"]);
    expect(onExpandedChange).toHaveBeenLastCalledWith(["fruits"], expect.anything());
  });

  it("leaves a branch collapsed when canDrop vetoes nesting into it", async () => {
    mockRowRects();
    const onNodesChange = vi.fn();
    const onExpandedChange = vi.fn();
    render(
      <DndTree
        nodes={pearNodes}
        defaultExpandedValue={[]}
        onNodesChange={onNodesChange}
        onExpandedChange={onExpandedChange}
        canDrop={() => false}
      />,
    );

    pointerDrag(rowOf("Pear"), rowOf("Fruits"), 100, 10);
    await flush();

    expect(onNodesChange).not.toHaveBeenCalled();
    expect(onExpandedChange).not.toHaveBeenCalled();
  });

  it("measures reparent levels from the inline start edge in RTL", () => {
    mockRowRects();
    const onNodesChange = vi.fn();
    render(
      <DndTree
        nodes={pearNodes}
        onNodesChange={onNodesChange}
      />,
    );
    rowOf("Banana").style.direction = "rtl";

    pointerDrag(rowOf("Apple"), rowOf("Banana"), 195, 15);

    const next = onNodesChange.mock.calls[0][0] as TestNode[];
    expect(childIdsOf(next)).toEqual(["fruits", "apple", "pear"]);
  });
});
