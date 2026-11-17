import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createTestTree } from "./tree.fixtures";
import { TreeView } from "./TreeView";

const collection = createTestTree([
  { id: "src", label: "src", children: [{ id: "src/index.ts", label: "index.ts" }] },
]);

function renderTree({ checkable }: { checkable?: boolean } = {}) {
  return render(
    <TreeView.Root
      collection={collection}
      checkable={checkable}
      defaultExpandedValue={["src"]}
      data-testid="root"
    >
      <TreeView.Label>Files</TreeView.Label>
      <TreeView.Tree>
        {collection.rootNode.children?.map((node, index) => (
          <TreeView.NodeProvider
            key={node.id}
            node={node}
            indexPath={[index]}
          >
            <TreeView.Branch data-testid="branch">
              <TreeView.BranchControl data-testid="branch-control">
                <TreeView.BranchIndicator data-testid="chevron" />
                <TreeView.BranchText>{node.label}</TreeView.BranchText>
              </TreeView.BranchControl>
              <TreeView.BranchContent>
                {node.children?.map((child, childIndex) => (
                  <TreeView.NodeProvider
                    key={child.id}
                    node={child}
                    indexPath={[index, childIndex]}
                  >
                    <TreeView.Item data-testid="item">
                      <TreeView.ItemText>{child.label}</TreeView.ItemText>
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

  it("checks a checkable row with Space and exposes the state on its tree item", async () => {
    renderTree({ checkable: true });
    const branch = screen.getByTestId("branch");
    const item = screen.getByTestId("item");
    expect(item.getAttribute("aria-checked")).toBe("false");

    fireEvent.keyDown(item, { key: " " });
    await waitFor(() => expect(item.getAttribute("aria-checked")).toBe("true"));
    expect(branch.getAttribute("aria-checked")).toBe("true");

    fireEvent.keyDown(screen.getByTestId("branch-control"), { key: " " });
    await waitFor(() => expect(branch.getAttribute("aria-checked")).toBe("false"));
    expect(item.getAttribute("aria-checked")).toBe("false");
  });

  it("throws when a styled part renders without a Root provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TreeView.Label>orphan</TreeView.Label>)).toThrow();
    spy.mockRestore();
  });
});
