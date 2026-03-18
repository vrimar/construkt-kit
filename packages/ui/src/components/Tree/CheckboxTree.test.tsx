import { createTreeCollection } from "@ark-ui/react/tree-view";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CheckboxTree } from "./CheckboxTree";

vi.mock("../VirtualScrollArea", () => ({
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

const collection = createTreeCollection<TestNode>({
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

describe("CheckboxTree", () => {
  it("renders ancestor indent guides for virtualized descendants", () => {
    render(
      <CheckboxTree
        collection={collection}
        defaultExpandedValue={["src", "src/components"]}
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

  it("renders a single check icon for a fully checked branch", () => {
    render(
      <CheckboxTree
        collection={collection}
        checkedValue={["src/components/Button.tsx", "src/components/Input.tsx"]}
        defaultExpandedValue={["src", "src/components"]}
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
      <CheckboxTree
        collection={collection}
        checkedValue={["src/components/Button.tsx"]}
        defaultExpandedValue={["src", "src/components"]}
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
});
