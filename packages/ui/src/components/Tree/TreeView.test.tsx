import { type RenderOptions, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LocaleContext } from "../../primitives/locale";
import { DraggableTreeNode } from "./DraggableTreeNode";
import { testAccessors, type TestNode } from "./tree.fixtures";
import { TreeView, type TreeViewRootProps } from "./TreeView";

const nodes: TestNode[] = [
  { id: "src", label: "src", children: [{ id: "src/index.ts", label: "index.ts" }] },
];

function renderTree({ checkable }: { checkable?: boolean } = {}) {
  return render(
    <TreeView.Root
      nodes={nodes}
      {...testAccessors}
      checkable={checkable}
      defaultExpandedValue={["src"]}
      data-testid="root"
    >
      <TreeView.Label>Files</TreeView.Label>
      <TreeView.Tree>
        {nodes.map((node, index) => (
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

const renderNodes = (
  tree: TestNode[],
  props: Partial<TreeViewRootProps<TestNode>> = {},
  options?: RenderOptions,
) =>
  render(
    <TreeView.Root
      nodes={tree}
      {...testAccessors}
      {...props}
    >
      <TreeView.Tree>
        {tree.map((node, index) => (
          <DraggableTreeNode
            key={node.id}
            node={node}
            indexPath={[index]}
          />
        ))}
      </TreeView.Tree>
    </TreeView.Root>,
    options,
  );

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
      <TreeView.Root
        nodes={nodes}
        {...testAccessors}
      >
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

  it("checks a branch's enabled leaves and reads the branch from them", () => {
    const onCheckedChange = vi.fn();
    const tree: TestNode[] = [
      {
        id: "fruits",
        label: "Fruits",
        children: [
          { id: "apple", label: "Apple" },
          { id: "banana", label: "Banana", disabled: true },
        ],
      },
    ];
    const { container } = renderNodes(tree, {
      checkable: true,
      defaultExpandedValue: ["fruits"],
      onCheckedChange,
    });

    fireEvent.keyDown(screen.getByRole("button", { name: "Fruits" }), { key: " " });

    expect(onCheckedChange).toHaveBeenLastCalledWith(["apple"]);
    expect(
      container
        .querySelector('[role="treeitem"][data-value="fruits"]')
        ?.getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("selects nothing in selectionMode none, while pressing a branch still toggles it", () => {
    const onSelectionChange = vi.fn();
    const onExpandedChange = vi.fn();
    const { container } = renderNodes(nodes, {
      selectionMode: "none",
      defaultExpandedValue: ["src"],
      onSelectionChange,
      onExpandedChange,
    });
    const leaf = container.querySelector('[role="treeitem"][data-value="src/index.ts"]');

    fireEvent.click(leaf as Element);
    fireEvent.click(screen.getByRole("button", { name: "src" }));

    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(leaf?.hasAttribute("aria-selected")).toBe(false);
    expect(onExpandedChange).toHaveBeenLastCalledWith([], expect.anything());
  });

  it("reads a controlled expansion its owner turned down from the prop", () => {
    const tree: TestNode[] = [
      {
        id: "src",
        label: "src",
        children: [
          { id: "src/lib", label: "lib", children: [{ id: "src/lib/a.ts", label: "a.ts" }] },
        ],
      },
    ];
    renderNodes(tree, { expandedValue: ["src"], onExpandedChange: () => {} });
    const lib = screen.getByRole("button", { name: "lib" });
    lib.focus();

    fireEvent.keyDown(lib, { key: "ArrowRight" });
    fireEvent.keyDown(lib, { key: "ArrowLeft" });

    expect(document.activeElement).toBe(screen.getByRole("button", { name: "src" }));
  });

  it("throws when a styled part renders without a Root provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TreeView.Label>orphan</TreeView.Label>)).toThrow();
    spy.mockRestore();
  });

  it("mirrors the arrows that open and close a branch in RTL", () => {
    const onExpandedChange = vi.fn();
    renderNodes(
      nodes,
      { onExpandedChange },
      {
        wrapper: ({ children }) => (
          <LocaleContext value={{ locale: "ar", dir: "rtl" }}>{children}</LocaleContext>
        ),
      },
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "src" }), { key: "ArrowLeft" });

    expect(onExpandedChange).toHaveBeenLastCalledWith(["src"], expect.anything());
  });

  describe("multiple selection", () => {
    const fruits: TestNode[] = [
      { id: "apple", label: "Apple" },
      { id: "avocado", label: "Avocado", disabled: true },
      { id: "apricot", label: "Apricot" },
      { id: "banana", label: "Banana" },
    ];

    const renderFruits = () => {
      const onSelectionChange = vi.fn();
      renderNodes(fruits, { selectionMode: "multiple", onSelectionChange });
      return onSelectionChange;
    };
    const row = (name: string) => screen.getByRole("treeitem", { name });

    it("extends a Shift range from the last pressed row, past disabled rows", () => {
      const onSelectionChange = renderFruits();

      fireEvent.click(row("Apple"));
      fireEvent.click(row("Apricot"), { shiftKey: true });

      expect(onSelectionChange).toHaveBeenLastCalledWith(["apple", "apricot"], expect.anything());
    });

    it("selects every enabled node on Ctrl+A", () => {
      const onSelectionChange = renderFruits();

      fireEvent.keyDown(row("Apple"), { key: "a", ctrlKey: true });

      expect(onSelectionChange).toHaveBeenLastCalledWith(
        ["apple", "apricot", "banana"],
        expect.anything(),
      );
    });
  });

  it("skips disabled rows on typeahead", () => {
    const fruits: TestNode[] = [
      { id: "apple", label: "Apple" },
      { id: "avocado", label: "Avocado", disabled: true },
      { id: "apricot", label: "Apricot" },
    ];
    renderNodes(fruits);
    const apple = screen.getByRole("treeitem", { name: "Apple" });
    apple.focus();

    fireEvent.keyDown(apple, { key: "a" });

    expect(document.activeElement).toBe(screen.getByRole("treeitem", { name: "Apricot" }));
  });
});
