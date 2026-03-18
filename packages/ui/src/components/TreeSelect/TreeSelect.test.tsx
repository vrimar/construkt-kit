import { createTreeCollection, type TreeCollection } from "@ark-ui/react/tree-view";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TreeSelect } from "./TreeSelect";

const checkboxTreeSpy = vi.fn();

vi.mock("../Tree/CheckboxTree", () => ({
  CheckboxTree: (props: Record<string, unknown>) => {
    checkboxTreeSpy(props);

    return (
      <div>
        <button
          type="button"
          onClick={() => {
            const onCheckedChange = props.onCheckedChange as ((checkedValue: string[]) => void) | undefined;
            onCheckedChange?.(["apple"]);
          }}
        >
          Toggle Apple
        </button>
      </div>
    );
  },
}));

afterEach(() => {
  cleanup();
  checkboxTreeSpy.mockClear();
});

interface DemoNode {
  id: string;
  label: string;
  children?: DemoNode[];
}

const collection = createTreeCollection<DemoNode>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.label,
  rootNode: {
    id: "ROOT",
    label: "",
    children: [
      {
        id: "fruits",
        label: "Fruits",
        children: [
          { id: "apple", label: "Apple" },
          { id: "banana", label: "Banana" },
        ],
      },
      {
        id: "vegetables",
        label: "Vegetables",
        children: [{ id: "carrot", label: "Carrot" }],
      },
    ],
  },
});

const getLastCheckboxTreeProps = () => {
  const calls = checkboxTreeSpy.mock.calls;

  return calls[calls.length - 1]?.[0] as {
    collection: TreeCollection<DemoNode>;
    checkedValue: string[];
    maxHeight: string;
    size: "sm" | "md";
    isNodeCheckable: (details: { node: DemoNode; indexPath: number[]; isBranch: boolean }) => boolean;
  };
};

describe("TreeSelect", () => {
  it("preserves hidden selections when filtered checkbox changes", () => {
    const onValueChange = vi.fn();

    render(
      <TreeSelect
        collection={collection}
        value={["carrot"]}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "app" } });
    fireEvent.click(screen.getByRole("button", { name: "Toggle Apple" }));

    expect(onValueChange).toHaveBeenCalledWith(["carrot", "apple"]);
  });

  it("marks only branches with visible leaf descendants as checkable", () => {
    render(
      <TreeSelect
        collection={collection}
        value={[]}
        onValueChange={vi.fn()}
      />,
    );

    const props = getLastCheckboxTreeProps();
    const fruitsNode = props.collection.findNode("fruits");
    const appleNode = props.collection.findNode("apple");

    expect(fruitsNode).toBeDefined();
    expect(appleNode).toBeDefined();

    if (!fruitsNode || !appleNode) {
      throw new Error("Expected demo tree nodes to exist");
    }

    expect(props.isNodeCheckable({ node: fruitsNode, indexPath: [0], isBranch: true })).toBe(true);
    expect(props.isNodeCheckable({ node: appleNode, indexPath: [0, 0], isBranch: false })).toBe(true);
  });

  it("defaults the shared tree size to md", () => {
    render(
      <TreeSelect
        collection={collection}
        value={[]}
        onValueChange={vi.fn()}
      />,
    );

    expect(getLastCheckboxTreeProps().size).toBe("md");
  });

  it("defaults to a concrete tree max height for unconstrained layouts", () => {
    render(
      <TreeSelect
        collection={collection}
        value={[]}
        onValueChange={vi.fn()}
      />,
    );

    expect(getLastCheckboxTreeProps().maxHeight).toBe("320px");
  });
});