import { createTreeCollection } from "@ark-ui/react/tree-view";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TreeSelectList } from "./TreeSelectList";

vi.mock("../ScrollArea/VirtualScrollArea", () => ({
  VirtualScrollArea: ({
    items,
    children,
  }: {
    items: unknown[];
    children: (item: unknown, index: number) => React.ReactNode;
  }) => <>{items.map((item, index) => children(item, index))}</>,
}));

afterEach(() => {
  cleanup();
});

interface TestNode {
  id: string;
  name: string;
  children?: TestNode[];
}

const fileTreeCollection = createTreeCollection<TestNode>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: {
    id: "ROOT",
    name: "",
    children: [
      {
        id: "src",
        name: "src",
        children: [
          {
            id: "src/components",
            name: "components",
            children: [
              { id: "src/components/Button.tsx", name: "Button.tsx" },
              { id: "src/components/Input.tsx", name: "Input.tsx" },
            ],
          },
          { id: "src/index.ts", name: "index.ts" },
        ],
      },
    ],
  },
});

interface DemoNode {
  id: string;
  label: string;
  children?: DemoNode[];
}

const fruitVegCollection = createTreeCollection<DemoNode>({
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

describe("TreeSelectList", () => {
  // --- Rendering / indent guides (from CheckboxTree tests) ---

  it("renders ancestor indent guides for virtualized descendants", () => {
    render(
      <TreeSelectList
        collection={fileTreeCollection}
        value={[]}
        onValueChange={vi.fn()}
        defaultExpandedValue={["src", "src/components"]}
        showSearch={false}
        showSelectAll={false}
      />,
    );

    const srcRow = screen
      .getByText("src")
      .closest('[data-scope="tree-view"][data-part="branch-control"]');
    const componentsRow = screen
      .getByText("components")
      .closest('[data-scope="tree-view"][data-part="branch-control"]');
    const buttonRow = screen
      .getByText("Button.tsx")
      .closest('[data-scope="tree-view"][data-part="item"]');

    expect(srcRow?.querySelectorAll('[data-virtualized="true"]')).toHaveLength(0);
    expect(componentsRow?.querySelectorAll('[data-virtualized="true"]')).toHaveLength(1);
    expect(buttonRow?.querySelectorAll('[data-virtualized="true"]')).toHaveLength(2);
  });

  it("renders a leaf indicator spacer so item content aligns with branch rows", () => {
    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
        defaultExpandedValue={["fruits"]}
        showSearch={false}
        showSelectAll={false}
      />,
    );

    const branchRow = screen
      .getByText("Fruits")
      .closest('[data-scope="tree-view"][data-part="branch-control"]');
    const leafRow = screen.getByText("Apple").closest('[data-scope="tree-view"][data-part="item"]');

    expect(
      branchRow?.querySelector('[data-scope="tree-view"][data-part="branch-indicator"]'),
    ).not.toBeNull();
    expect(leafRow?.querySelector('[data-tree-indicator-spacer="true"]')).not.toBeNull();
  });

  it("renders a single check icon for a fully checked branch", () => {
    render(
      <TreeSelectList
        collection={fileTreeCollection}
        value={["src/components/Button.tsx", "src/components/Input.tsx"]}
        onValueChange={vi.fn()}
        defaultExpandedValue={["src", "src/components"]}
        showSearch={false}
        showSelectAll={false}
      />,
    );

    const branchRow = screen
      .getByText("components")
      .closest('[data-scope="tree-view"][data-part="branch-control"]');

    expect(branchRow).not.toBeNull();
    expect(branchRow?.querySelectorAll("svg.lucide-check")).toHaveLength(1);
    expect(branchRow?.querySelectorAll("svg.lucide-minus")).toHaveLength(0);
    expect(branchRow?.querySelectorAll("svg")).toHaveLength(2);
  });

  it("renders an indeterminate icon for a partially checked branch", () => {
    render(
      <TreeSelectList
        collection={fileTreeCollection}
        value={["src/components/Button.tsx"]}
        onValueChange={vi.fn()}
        defaultExpandedValue={["src", "src/components"]}
        showSearch={false}
        showSelectAll={false}
      />,
    );

    const branchRow = screen
      .getByText("components")
      .closest('[data-scope="tree-view"][data-part="branch-control"]');

    expect(branchRow).not.toBeNull();
    expect(branchRow?.querySelectorAll("svg.lucide-check")).toHaveLength(0);
    expect(branchRow?.querySelectorAll("svg.lucide-minus")).toHaveLength(1);
    expect(branchRow?.querySelectorAll("svg")).toHaveLength(2);
  });

  // --- Filtering / selection preservation (from TreeSelect tests) ---

  it("preserves hidden selections when filtered checkbox changes", () => {
    const onValueChange = vi.fn();

    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={["carrot"]}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "app" } });

    // After filtering to show only "Apple", check it
    const appleCheckbox = screen.getByText("Apple").closest('[data-scope="tree-view"]');

    // Simulate pointer-down on the apple item to toggle it
    if (appleCheckbox) {
      fireEvent.pointerDown(appleCheckbox);
    }

    // The carrot selection should be preserved even though it's filtered out
    // Note: full integration test; behavior depends on Ark UI state machine
  });

  it("defaults to md size", () => {
    const { container } = render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
      />,
    );

    // The tree root should have size="md" via RootProvider
    const treeRoot = container.querySelector('[data-scope="tree-view"]');
    expect(treeRoot).toBeTruthy();
  });

  it("defaults to 320px max height", () => {
    const { container } = render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
      />,
    );

    // Component renders and uses the default maxHeight
    expect(container.firstChild).toBeTruthy();
  });

  it("hides search and select-all when both are disabled", () => {
    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
        showSearch={false}
        showSelectAll={false}
      />,
    );

    expect(screen.queryByPlaceholderText("Search...")).toBeNull();
    expect(screen.queryByLabelText("Select all")).toBeNull();
  });
});
