import { createTreeCollection } from "@ark-ui/react/tree-view";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TreeView } from "./TreeView";

afterEach(() => {
  cleanup();
});

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

const collection = createTreeCollection<Node>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: {
    id: "ROOT",
    name: "",
    children: [{ id: "src", name: "src", children: [{ id: "src/index.ts", name: "index.ts" }] }],
  },
});

function renderTree() {
  return render(
    <TreeView.Root collection={collection} defaultExpandedValue={["src"]} data-testid="root">
      <TreeView.Label>Files</TreeView.Label>
      <TreeView.Tree>
        {collection.rootNode.children?.map((node, index) => (
          <TreeView.NodeProvider key={node.id} node={node} indexPath={[index]}>
            <TreeView.Branch>
              <TreeView.BranchControl data-testid="branch-control">
                <TreeView.BranchIndicator data-testid="chevron" />
                <TreeView.BranchText>{node.name}</TreeView.BranchText>
              </TreeView.BranchControl>
              <TreeView.BranchContent>
                {node.children?.map((child, childIndex) => (
                  <TreeView.NodeProvider
                    key={child.id}
                    node={child}
                    indexPath={[index, childIndex]}
                  >
                    <TreeView.Item data-testid="item">
                      <TreeView.ItemText>{child.name}</TreeView.ItemText>
                    </TreeView.Item>
                  </TreeView.NodeProvider>
                ))}
              </TreeView.BranchContent>
            </TreeView.Branch>
          </TreeView.NodeProvider>
        ))}
      </TreeView.Tree>
    </TreeView.Root>,
  );
}

describe("TreeView", () => {
  it("applies the root slot class from the recipe", () => {
    renderTree();
    expect(screen.getByTestId("root").className).toContain("tree-view__root");
  });

  it("styles nested parts through the shared style context", () => {
    renderTree();
    expect(screen.getByTestId("branch-control").className).toContain("tree-view__branchControl");
    expect(screen.getByTestId("item").className).toContain("tree-view__item");
    expect(screen.getByText("index.ts")).toBeTruthy();
  });

  it("injects a default chevron icon into BranchIndicator", () => {
    renderTree();
    expect(screen.getByTestId("chevron").querySelector("svg")).toBeTruthy();
  });

  it("styles the custom DropIndicator via the dropIndicator slot", () => {
    render(
      <TreeView.Root collection={collection}>
        <TreeView.DropIndicator data-testid="drop" />
      </TreeView.Root>,
    );
    expect(screen.getByTestId("drop").className).toContain("tree-view__dropIndicator");
  });

  it("throws when a styled part renders without a Root provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TreeView.Label>orphan</TreeView.Label>)).toThrow();
    spy.mockRestore();
  });
});
