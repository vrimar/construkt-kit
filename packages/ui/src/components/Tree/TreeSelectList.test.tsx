import {
  type TreeCollection,
  type TreeViewLoadChildrenDetails,
  useTreeViewContext,
} from "@ark-ui/react/tree-view";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import { createTestTree, type TestNode } from "./tree.fixtures";
import { TreeSelectList, type TreeSelectListProps } from "./TreeSelectList";

const virtualScrollAreaProps = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));

vi.mock("../ScrollArea/VirtualScrollArea", () => ({
  VirtualScrollArea: ({
    items,
    children,
    ...props
  }: {
    items: unknown[];
    children: (item: unknown, index: number) => React.ReactNode;
  }) => {
    virtualScrollAreaProps.current = props;
    return <>{items.map((item, index) => children(item, index))}</>;
  },
}));

const fileTreeCollection = createTestTree([
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "src/components",
        label: "components",
        children: [
          { id: "src/components/Button.tsx", label: "Button.tsx" },
          { id: "src/components/Input.tsx", label: "Input.tsx" },
        ],
      },
      { id: "src/index.ts", label: "index.ts" },
    ],
  },
]);

const fruitVegCollection = createTestTree([
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
]);

type ListProps = Partial<TreeSelectListProps<TestNode>>;

const listOnly = { search: { showInput: false }, showSelectAll: false } satisfies ListProps;

const treeSelectList = ({
  loadChildren,
  onLoadChildrenComplete = () => {},
  onLoadChildrenError,
  ...overrides
}: ListProps = {}) => {
  const props = { collection: fruitVegCollection, value: [], onValueChange: vi.fn(), ...overrides };
  return loadChildren ? (
    <TreeSelectList
      {...props}
      loadChildren={loadChildren}
      onLoadChildrenComplete={onLoadChildrenComplete}
      onLoadChildrenError={onLoadChildrenError}
    />
  ) : (
    <TreeSelectList {...props} />
  );
};

const renderList = (props?: ListProps) => {
  const view = render(treeSelectList(props));
  return { ...view, rerender: (next?: ListProps) => view.rerender(treeSelectList(next)) };
};

describe("TreeSelectList", () => {
  // --- Rendering / indent guides (from CheckboxTree tests) ---

  it("renders ancestor indent guides for virtualized descendants", () => {
    renderList({
      ...listOnly,
      collection: fileTreeCollection,
      defaultExpandedValue: ["src", "src/components"],
    });

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
    renderList({ ...listOnly, defaultExpandedValue: ["fruits"] });

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
    renderList({
      ...listOnly,
      collection: fileTreeCollection,
      value: ["src/components/Button.tsx", "src/components/Input.tsx"],
      defaultExpandedValue: ["src", "src/components"],
    });

    const branchRow = screen
      .getByText("components")
      .closest('[data-scope="tree-view"][data-part="branch-control"]');

    expect(branchRow).not.toBeNull();
    expect(branchRow?.querySelectorAll("svg.lucide-check")).toHaveLength(1);
    expect(branchRow?.querySelectorAll("svg.lucide-minus")).toHaveLength(0);
    expect(branchRow?.querySelectorAll("svg")).toHaveLength(2);
  });

  it("renders an indeterminate icon for a partially checked branch", () => {
    renderList({
      ...listOnly,
      collection: fileTreeCollection,
      value: ["src/components/Button.tsx"],
      defaultExpandedValue: ["src", "src/components"],
    });

    const branchRow = screen
      .getByText("components")
      .closest('[data-scope="tree-view"][data-part="branch-control"]');

    expect(branchRow).not.toBeNull();
    expect(branchRow?.querySelectorAll("svg.lucide-check")).toHaveLength(0);
    expect(branchRow?.querySelectorAll("svg.lucide-minus")).toHaveLength(1);
    expect(branchRow?.querySelectorAll("svg")).toHaveLength(2);
  });

  // --- Filtering / selection preservation (from TreeSelect tests) ---

  it("preserves hidden selections when a filtered checkbox changes", async () => {
    const onValueChange = vi.fn();

    renderList({ value: ["carrot"], onValueChange });

    fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "app" } });

    const appleCheckbox = screen
      .getByText("Apple")
      .closest('[data-scope="tree-view"][data-part="item"]')
      ?.querySelector('[data-scope="tree-view"][data-part="node-checkbox"]');
    fireEvent.click(appleCheckbox as Element);

    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(["carrot", "apple"]));
  });

  it("defaults to md size", () => {
    const { container } = renderList();

    expect(container.querySelector('[class*="tree-view__root--size_md"]')).not.toBeNull();
  });

  it("hides search and select-all when both are disabled", () => {
    renderList(listOnly);

    expect(screen.queryByPlaceholderText("Search...")).toBeNull();
    expect(screen.queryByLabelText("Select all")).toBeNull();
  });

  // --- Drag and drop ---

  it("makes rows draggable when onCollectionChange is provided", () => {
    renderList({
      ...listOnly,
      onCollectionChange: vi.fn(),
      defaultExpandedValue: ["fruits", "vegetables"],
    });

    expect(screen.getByText("Fruits").closest("[draggable='true']")).not.toBeNull();
    expect(screen.getByText("Apple").closest("[draggable='true']")).not.toBeNull();
  });

  it("leaves rows non-draggable without onCollectionChange", () => {
    renderList({ ...listOnly, defaultExpandedValue: ["fruits", "vegetables"] });

    expect(screen.getByText("Fruits").closest("[draggable='true']")).toBeNull();
  });

  it("reorders a node via keyboard (Ctrl+ArrowDown) and commits the change", () => {
    const onCollectionChange = vi.fn();
    renderList({
      ...listOnly,
      onCollectionChange,
      defaultExpandedValue: ["fruits", "vegetables"],
    });

    const apple = screen.getByText("Apple").closest("[draggable='true']");
    expect(apple).not.toBeNull();
    fireEvent.keyDown(apple as HTMLElement, { key: "ArrowDown", ctrlKey: true });

    expect(onCollectionChange).toHaveBeenCalledTimes(1);
    const next = onCollectionChange.mock.calls[0][0] as TreeCollection<TestNode>;
    expect(next.getNodeChildren(next.findNode("fruits") as TestNode).map((n) => n.id)).toEqual([
      "banana",
      "apple",
    ]);
  });

  it.each([
    ["canDrop", { canDrop: () => false }, "Apple", "ArrowDown"],
    ["blockReparent", { blockReparent: true }, "Carrot", "ArrowLeft"],
    ["isNodeDraggable", { isNodeDraggable: () => false }, "Apple", "ArrowDown"],
  ] satisfies [string, ListProps, string, string][])(
    "keyboard moves respect the %s veto",
    (_, veto, label, key) => {
      const onCollectionChange = vi.fn();
      renderList({
        ...listOnly,
        onCollectionChange,
        defaultExpandedValue: ["fruits", "vegetables"],
        ...veto,
      });
      const row = screen.getByText(label).closest("[draggable='true']");
      fireEvent.keyDown(row as HTMLElement, { key, ctrlKey: true });
      expect(onCollectionChange).not.toHaveBeenCalled();
    },
  );

  it("keyboard-moves every getDragValues node, as a pointer drag does", () => {
    const onCollectionChange = vi.fn();
    renderList({
      ...listOnly,
      onCollectionChange,
      getDragValues: (value) => (value === "apple" ? ["apple", "carrot"] : [value]),
      defaultExpandedValue: ["fruits", "vegetables"],
    });
    const apple = screen.getByText("Apple").closest("[draggable='true']");
    fireEvent.keyDown(apple as HTMLElement, { key: "ArrowDown", ctrlKey: true });

    expect(onCollectionChange).toHaveBeenCalledTimes(1);
    const next = onCollectionChange.mock.calls[0][0] as TreeCollection<TestNode>;
    const childIds = (value: string) =>
      next.getNodeChildren(next.findNode(value) as TestNode).map((n) => n.id);
    expect(childIds("fruits")).toEqual(["banana", "apple", "carrot"]);
    expect(childIds("vegetables")).toEqual([]);
  });

  it("expands a collapsed branch on keyboard indent and keeps focus on the moved node", async () => {
    const onExpandedChange = vi.fn();
    const ReorderableTree = () => {
      const [collection, setCollection] = useState(fruitVegCollection);
      return treeSelectList({
        ...listOnly,
        collection,
        onCollectionChange: setCollection,
        defaultExpandedValue: [],
        onExpandedChange,
      });
    };
    render(<ReorderableTree />);
    const vegetables = screen.getByText("Vegetables").closest("[draggable='true']") as HTMLElement;
    vegetables.focus();

    fireEvent.keyDown(vegetables, { key: "ArrowRight", ctrlKey: true });

    await waitFor(() => expect(onExpandedChange).toHaveBeenLastCalledWith(["fruits"]));
    const moved = screen.getByText("Vegetables").closest("[draggable='true']");
    expect(moved?.getAttribute("data-depth")).toBe("2");
    await waitFor(() => expect(document.activeElement).toBe(moved));
  });

  it("renders an assistive-tech live region when DnD is enabled", async () => {
    const { container } = renderList({ ...listOnly, onCollectionChange: vi.fn() });

    expect(container.querySelector("[aria-live]")).not.toBeNull();
  });
});

const rowOf = (label: string) =>
  screen
    .getByText(label)
    .closest<HTMLElement>(
      '[data-scope="tree-view"][data-part="branch-control"], [data-scope="tree-view"][data-part="item"]',
    ) as HTMLElement;

const checkboxOf = (label: string) => rowOf(label).querySelector('[data-part="node-checkbox"]');

const indicatorOf = (label: string) =>
  rowOf(label).querySelector('[data-part="branch-indicator"]') as HTMLElement;

const searchInput = () => screen.getByPlaceholderText("Search...");

const flush = () => act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

const clickRow = async (label: string) => {
  fireEvent.click(rowOf(label));
  await flush();
};

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe("TreeSelectList search", () => {
  it("renders the virtual scroll area with vertical scrollbars only", () => {
    renderList();

    expect(virtualScrollAreaProps.current.scrollbars).toBe("vertical");
  });

  it("filters by a controlled query and only reports typing until the prop changes", () => {
    const onQueryChange = vi.fn();
    const { rerender } = renderList({ search: { query: "app", onQueryChange } });

    expect(screen.getByText("Fruits")).toBeTruthy();
    expect(screen.getByText("Apple")).toBeTruthy();
    expect(screen.queryByText("Banana")).toBeNull();
    expect(screen.queryByText("Vegetables")).toBeNull();

    fireEvent.change(searchInput(), { target: { value: "carr" } });

    expect(onQueryChange).toHaveBeenCalledWith("carr");
    expect((searchInput() as HTMLInputElement).value).toBe("app");
    expect(screen.getByText("Apple")).toBeTruthy();
    expect(screen.queryByText("Carrot")).toBeNull();

    rerender({ search: { query: "carr", onQueryChange } });

    expect(screen.getByText("Carrot")).toBeTruthy();
    expect(screen.queryByText("Apple")).toBeNull();
  });

  it("applies defaultQuery to an uncontrolled search", () => {
    renderList({ search: { defaultQuery: "ban" } });

    expect((searchInput() as HTMLInputElement).value).toBe("ban");
    expect(screen.getByText("Banana")).toBeTruthy();
    expect(screen.queryByText("Apple")).toBeNull();
  });

  it("renders the collection unfiltered in external search mode", () => {
    const filter = vi.fn(() => false);
    renderList({ search: { mode: "external", query: "zzz", filter } });

    expect(screen.getByText("Apple")).toBeTruthy();
    expect(screen.getByText("Banana")).toBeTruthy();
    expect(screen.getByText("Carrot")).toBeTruthy();
    expect(filter).not.toHaveBeenCalled();
  });

  it("auto-expands matches during a query without reporting expansion", () => {
    const onExpandedChange = vi.fn();
    renderList({ defaultExpandedValue: [], onExpandedChange });

    expect(screen.queryByText("Apple")).toBeNull();

    fireEvent.change(searchInput(), { target: { value: "app" } });

    expect(screen.getByText("Apple")).toBeTruthy();
    expect(rowOf("Fruits").getAttribute("data-state")).toBe("open");
    expect(onExpandedChange).not.toHaveBeenCalled();

    fireEvent.change(searchInput(), { target: { value: "" } });

    expect(screen.queryByText("Apple")).toBeNull();
    expect(rowOf("Fruits").getAttribute("data-state")).toBe("closed");
    expect(onExpandedChange).not.toHaveBeenCalled();
  });

  it("keeps a branch collapsed during a query until the query changes", async () => {
    const onExpandedChange = vi.fn();
    renderList({ defaultExpandedValue: [], onExpandedChange });

    fireEvent.change(searchInput(), { target: { value: "a" } });
    expect(screen.getByText("Apple")).toBeTruthy();
    expect(screen.getByText("Carrot")).toBeTruthy();

    await clickRow("Fruits");

    expect(screen.queryByText("Apple")).toBeNull();
    expect(screen.queryByText("Banana")).toBeNull();
    expect(screen.getByText("Carrot")).toBeTruthy();
    expect(onExpandedChange).not.toHaveBeenCalled();

    fireEvent.change(searchInput(), { target: { value: "ap" } });

    expect(screen.getByText("Apple")).toBeTruthy();
    expect(rowOf("Fruits").getAttribute("data-state")).toBe("open");

    fireEvent.change(searchInput(), { target: { value: "a" } });

    expect(rowOf("Fruits").getAttribute("data-state")).toBe("open");
  });

  it("keeps stored expansion while searching when expandOnSearch is false", async () => {
    const onExpandedChange = vi.fn();
    renderList({ defaultExpandedValue: [], onExpandedChange, expandOnSearch: false });

    fireEvent.change(searchInput(), { target: { value: "app" } });

    expect(screen.getByText("Fruits")).toBeTruthy();
    expect(screen.queryByText("Apple")).toBeNull();

    await clickRow("Fruits");

    expect(screen.getByText("Apple")).toBeTruthy();
    expect(onExpandedChange).toHaveBeenLastCalledWith(["fruits"]);
  });

  it("disables dragging while a query is active", () => {
    const onCollectionChange = vi.fn();
    const { rerender } = renderList({ onCollectionChange, search: { query: "a" } });

    expect(screen.getByText("Apple").closest("[draggable='true']")).toBeNull();

    rerender({ onCollectionChange, search: { query: "" } });

    expect(screen.getByText("Apple").closest("[draggable='true']")).not.toBeNull();
  });

  it("selects and deselects only the displayed leaves during a query", () => {
    const onValueChange = vi.fn();
    const { rerender } = renderList({
      value: ["carrot"],
      onValueChange,
      search: { query: "app" },
    });

    fireEvent.click(screen.getByLabelText("Select all"));
    expect(onValueChange).toHaveBeenLastCalledWith(["carrot", "apple"]);

    rerender({ value: ["carrot", "apple"], onValueChange, search: { query: "app" } });

    fireEvent.click(screen.getByLabelText("Deselect all"));
    expect(onValueChange).toHaveBeenLastCalledWith(["carrot"]);
  });

  it("never selects a matching branch whose children the query filtered out", () => {
    const onValueChange = vi.fn();
    renderList({ onValueChange, search: { query: "fruit" } });

    fireEvent.click(screen.getByLabelText("Select all"));
    expect(onValueChange).not.toHaveBeenCalledWith(expect.arrayContaining(["fruits"]));
  });

  it("never makes a matching branch with filtered-out children checkable", () => {
    const onValueChange = vi.fn();
    const pantryCollection = createTestTree([
      {
        id: "pantry",
        label: "Pantry",
        children: [
          {
            id: "fruits",
            label: "Fruits",
            children: [{ id: "apple", label: "Apple" }],
          },
          { id: "fruit-tea", label: "Fruit tea" },
        ],
      },
    ]);
    renderList({ collection: pantryCollection, onValueChange, search: { query: "fruit" } });

    expect(checkboxOf("Fruits")).toBeNull();
    expect(checkboxOf("Pantry")).toBeNull();
    expect(checkboxOf("Fruit tea")).not.toBeNull();

    fireEvent.click(screen.getByLabelText("Select all"));
    expect(onValueChange).toHaveBeenLastCalledWith(["fruit-tea"]);
  });

  it("skips leaves isNodeCheckable rejects on select-all", () => {
    const onValueChange = vi.fn();
    const props = {
      onValueChange,
      isNodeCheckable: ({ node }: { node: TestNode }) => node.id !== "banana",
    };
    const { rerender } = renderList(props);

    fireEvent.click(screen.getByLabelText("Select all"));
    expect(onValueChange).toHaveBeenLastCalledWith(["apple", "carrot"]);

    rerender({ ...props, value: ["apple", "carrot"] });

    fireEvent.click(screen.getByLabelText("Deselect all"));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it("keeps unknown ids on select-all and deselect-all without a query", () => {
    const onValueChange = vi.fn();
    const { rerender } = renderList({ value: ["stale"], onValueChange });

    fireEvent.click(screen.getByLabelText("Select all"));
    expect(onValueChange).toHaveBeenLastCalledWith(["stale", "apple", "banana", "carrot"]);

    rerender({ value: ["stale", "apple", "banana", "carrot"], onValueChange });

    fireEvent.click(screen.getByLabelText("Deselect all"));
    expect(onValueChange).toHaveBeenLastCalledWith(["stale"]);
  });
});

describe("TreeSelectList checking and keyboard", () => {
  it("toggles a leaf with Space and Enter", () => {
    const onValueChange = vi.fn();
    const { rerender } = renderList({ ...listOnly, onValueChange });

    fireEvent.keyDown(rowOf("Apple"), { key: " " });
    expect(onValueChange).toHaveBeenLastCalledWith(["apple"]);

    rerender({ ...listOnly, onValueChange, value: ["apple"] });
    fireEvent.keyDown(rowOf("Apple"), { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it("checks a branch with Space and leaves Enter to toggle its expansion", async () => {
    const onValueChange = vi.fn();
    renderList({ ...listOnly, onValueChange });

    fireEvent.keyDown(rowOf("Fruits"), { key: "Enter" });
    await flush();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(rowOf("Fruits").getAttribute("data-state")).toBe("closed");

    fireEvent.keyDown(rowOf("Fruits"), { key: " " });
    expect(onValueChange).toHaveBeenLastCalledWith(["apple", "banana"]);
  });

  it("leaves keys pressed on a row action to the action", async () => {
    const onValueChange = vi.fn();
    const onCollectionChange = vi.fn();
    renderList({
      ...listOnly,
      onValueChange,
      onCollectionChange,
      renderActions: ({ node }) => <button type="button">Edit {node.label}</button>,
    });
    const fruitsAction = screen.getByRole("button", { name: "Edit Fruits" });

    expect(fireEvent.keyDown(fruitsAction, { key: "Enter" })).toBe(true);
    expect(fireEvent.keyDown(fruitsAction, { key: " " })).toBe(true);
    fireEvent.keyDown(screen.getByRole("button", { name: "Edit Apple" }), {
      key: "ArrowDown",
      ctrlKey: true,
    });
    await flush();

    expect(rowOf("Fruits").getAttribute("data-state")).toBe("open");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onCollectionChange).not.toHaveBeenCalled();
  });

  it("exposes flat branch rows as expandable tree items", () => {
    renderList({ ...listOnly, collection: fileTreeCollection, defaultExpandedValue: ["src"] });

    expect(rowOf("src").getAttribute("role")).toBe("treeitem");
    expect(rowOf("src").getAttribute("aria-expanded")).toBe("true");
    expect(rowOf("components").getAttribute("aria-expanded")).toBe("false");
    expect(rowOf("components").getAttribute("aria-level")).toBe("2");
  });

  it("scrolls keyboard targets into view and keeps the focused row mounted", async () => {
    renderList(listOnly);
    const scrollToIndex = vi.fn();
    (virtualScrollAreaProps.current.scrollToIndexRef as { current: unknown }).current =
      scrollToIndex;
    expect(virtualScrollAreaProps.current.keepMountedIndex).toBe(0);

    rowOf("Fruits").focus();
    fireEvent.keyDown(rowOf("Fruits"), { key: "End" });
    await flush();

    expect(scrollToIndex).toHaveBeenCalledWith(4);
    await waitFor(() => expect(document.activeElement).toBe(rowOf("Carrot")));
    expect(virtualScrollAreaProps.current.keepMountedIndex).toBe(4);
  });

  const bananaLocked = {
    ...listOnly,
    isNodeCheckable: ({ node }: { node: TestNode }) => node.id !== "banana",
  };

  it("toggles only checkable leaves from a branch checkbox, both ways", () => {
    const onValueChange = vi.fn();
    const { rerender } = renderList({ ...bananaLocked, onValueChange });

    fireEvent.click(checkboxOf("Fruits") as Element);
    expect(onValueChange).toHaveBeenLastCalledWith(["apple"]);

    rerender({ ...bananaLocked, onValueChange, value: ["apple", "banana"] });
    fireEvent.click(checkboxOf("Fruits") as Element);
    expect(onValueChange).toHaveBeenLastCalledWith(["banana"]);
  });

  it("gives no checkbox to a branch without checkable leaves", () => {
    renderList({ ...listOnly, isNodeCheckable: ({ node }) => node.id !== "carrot" });

    expect(checkboxOf("Vegetables")).toBeNull();
    expect(checkboxOf("Fruits")).not.toBeNull();
  });

  it("filters checks made through the tree context to checkable leaves", async () => {
    const onValueChange = vi.fn();
    const ToggleFruits = () => {
      const tree = useTreeViewContext();
      return (
        <button
          type="button"
          onClick={() => tree.toggleChecked("fruits", true)}
        >
          Toggle fruits
        </button>
      );
    };
    renderList({
      ...bananaLocked,
      value: ["stale"],
      onValueChange,
      renderActions: ({ node }) => (node.id === "carrot" ? <ToggleFruits /> : undefined),
    });

    fireEvent.click(screen.getByRole("button", { name: "Toggle fruits" }));
    await flush();
    expect(onValueChange).toHaveBeenLastCalledWith(["stale", "apple"]);
  });

  it("skips disabled leaves on select-all and branch toggles", () => {
    const onValueChange = vi.fn();
    renderList({
      collection: createTestTree([
        {
          id: "fruits",
          label: "Fruits",
          children: [
            { id: "apple", label: "Apple" },
            { id: "banana", label: "Banana", disabled: true },
          ],
        },
      ]),
      onValueChange,
      search: { showInput: false },
    });

    fireEvent.click(screen.getByLabelText("Select all"));
    expect(onValueChange).toHaveBeenLastCalledWith(["apple"]);

    fireEvent.click(checkboxOf("Fruits") as Element);
    expect(onValueChange).toHaveBeenLastCalledWith(["apple"]);
  });

  it("leaves locked nodes out of a multi-node move", () => {
    const onCollectionChange = vi.fn();
    renderList({
      ...listOnly,
      onCollectionChange,
      getDragValues: (value) => (value === "apple" ? ["apple", "carrot"] : [value]),
      isNodeDraggable: (node) => node.id !== "carrot",
    });

    fireEvent.keyDown(rowOf("Apple"), { key: "ArrowDown", ctrlKey: true });

    const next = onCollectionChange.mock.calls[0][0] as TreeCollection<TestNode>;
    const childIds = (value: string) =>
      next.getNodeChildren(next.findNode(value) as TestNode).map((n) => n.id);
    expect(childIds("fruits")).toEqual(["banana", "apple"]);
    expect(childIds("vegetables")).toEqual(["carrot"]);
  });
});

const remoteChildren: TestNode[] = [
  { id: "remote/alpha", label: "Remote alpha" },
  { id: "remote/beta", label: "Remote beta" },
];

const createLazyCollection = (
  topLevel: TestNode[] = [
    { id: "fruits", label: "Fruits", children: [{ id: "apple", label: "Apple" }] },
    { id: "cloud", label: "Cloud", childrenCount: 1 },
    { id: "remote", label: "Remote", childrenCount: 2 },
    { id: "carrot", label: "Carrot" },
  ],
) => createTestTree(topLevel);

describe("TreeSelectList lazy loading", () => {
  it("renders a childrenCount-only branch collapsed, with a chevron and no checkbox", () => {
    const loadChildren = vi.fn(() => Promise.resolve(remoteChildren));
    renderList({ collection: createLazyCollection(), showSelectAll: false, loadChildren });

    expect(rowOf("Remote").getAttribute("data-part")).toBe("branch-control");
    expect(rowOf("Remote").getAttribute("data-state")).toBe("closed");
    expect(indicatorOf("Remote")).not.toBeNull();
    expect(checkboxOf("Remote")).toBeNull();
    expect(screen.getByText("Apple")).toBeTruthy();
    expect(loadChildren).not.toHaveBeenCalled();
  });

  it("loads on expand, marks the row busy and ignores clicks while pending", async () => {
    const collection = createLazyCollection();
    const load = deferred<TestNode[]>();
    const loadChildren = vi.fn((_details: TreeViewLoadChildrenDetails<TestNode>) => load.promise);
    renderList({ collection, showSelectAll: false, loadChildren });

    await clickRow("Remote");

    expect(loadChildren).toHaveBeenCalledTimes(1);
    const [details] = loadChildren.mock.calls[0];
    expect(details.node).toBe(collection.findNode("remote"));
    expect(details.indexPath).toEqual([2]);
    expect(details.valuePath).toEqual(["remote"]);
    expect(details.signal.aborted).toBe(false);
    expect(rowOf("Remote").hasAttribute("data-loading")).toBe(true);
    expect(rowOf("Remote").getAttribute("aria-busy")).toBe("true");
    expect(rowOf("Remote").getAttribute("data-state")).toBe("closed");

    await clickRow("Remote");

    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it("hands back the full source collection under a client query, then opens the branch", async () => {
    const load = deferred<TestNode[]>();
    const onLoadChildrenComplete = vi.fn();
    const props = {
      showSelectAll: false,
      loadChildren: () => load.promise,
      onLoadChildrenComplete,
      search: { query: "remote" },
    };
    const { rerender } = renderList({ collection: createLazyCollection(), ...props });

    expect(screen.queryByText("Apple")).toBeNull();
    await clickRow("Remote");
    load.resolve(remoteChildren);

    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1));
    const { collection: next } = onLoadChildrenComplete.mock.calls[0][0] as {
      collection: TreeCollection<TestNode>;
    };
    expect(next.findNode("apple")).toBeDefined();
    expect(next.findNode("cloud")).toBeDefined();
    expect(next.getNodeChildren(next.findNode("remote") as TestNode).map((n) => n.id)).toEqual([
      "remote/alpha",
      "remote/beta",
    ]);
    expect(rowOf("Remote").hasAttribute("data-loading")).toBe(false);

    rerender({ collection: next, ...props });

    expect(rowOf("Remote").getAttribute("data-state")).toBe("open");
    expect(checkboxOf("Remote alpha")).not.toBeNull();
    expect(checkboxOf("Remote")).not.toBeNull();
  });

  it("opens a loaded branch once the collection is applied without a query", async () => {
    const onExpandedChange = vi.fn();
    const onLoadChildrenComplete = vi.fn();
    const props = {
      showSelectAll: false,
      loadChildren: () => Promise.resolve(remoteChildren),
      onLoadChildrenComplete,
      onExpandedChange,
    };
    const { rerender } = renderList({ collection: createLazyCollection(), ...props });

    await clickRow("Remote");

    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1));
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(onExpandedChange).toHaveBeenLastCalledWith(["fruits", "remote"]);

    rerender({ collection: onLoadChildrenComplete.mock.calls[0][0].collection, ...props });

    expect(rowOf("Remote").getAttribute("data-state")).toBe("open");
    expect(screen.getByText("Remote beta")).toBeTruthy();
  });

  it("merges two loads that resolve in the same tick", async () => {
    const loads = { remote: deferred<TestNode[]>(), cloud: deferred<TestNode[]>() };
    const loadChildren = vi.fn(
      ({ node }: TreeViewLoadChildrenDetails<TestNode>) =>
        loads[node.id as keyof typeof loads].promise,
    );
    const onLoadChildrenComplete = vi.fn();
    renderList({
      collection: createLazyCollection(),
      showSelectAll: false,
      loadChildren,
      onLoadChildrenComplete,
    });

    await clickRow("Remote");
    await clickRow("Cloud");
    expect(loadChildren).toHaveBeenCalledTimes(2);

    loads.remote.resolve(remoteChildren);
    loads.cloud.resolve([{ id: "cloud/a", label: "Cloud a" }]);

    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(2));
    const { collection: merged } = onLoadChildrenComplete.mock.calls[1][0] as {
      collection: TreeCollection<TestNode>;
    };
    expect(merged.getNodeChildren(merged.findNode("remote") as TestNode)).toHaveLength(2);
    expect(merged.getNodeChildren(merged.findNode("cloud") as TestNode)).toHaveLength(1);
  });

  it("reports a rejected load, stays collapsed and retries on the next expand", async () => {
    const collection = createLazyCollection();
    const error = new Error("boom");
    const loadChildren = vi.fn(() => Promise.reject(error));
    const onLoadChildrenError = vi.fn();
    renderList({ collection, showSelectAll: false, loadChildren, onLoadChildrenError });

    await clickRow("Remote");

    await waitFor(() => expect(onLoadChildrenError).toHaveBeenCalledTimes(1));
    expect(onLoadChildrenError).toHaveBeenCalledWith({
      nodes: [
        { node: collection.findNode("remote"), error, indexPath: [2], valuePath: ["remote"] },
      ],
    });
    expect(rowOf("Remote").hasAttribute("data-loading")).toBe(false);
    expect(rowOf("Remote").getAttribute("data-state")).toBe("closed");

    await clickRow("Remote");

    expect(loadChildren).toHaveBeenCalledTimes(2);
  });

  it("opens a branch whose load came back empty and never reloads it", async () => {
    const loadChildren = vi.fn(() => Promise.resolve([] as TestNode[]));
    const onLoadChildrenComplete = vi.fn();
    const props = { showSelectAll: false, loadChildren, onLoadChildrenComplete };
    const { rerender } = renderList({ collection: createLazyCollection(), ...props });

    await clickRow("Remote");
    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1));
    rerender({ collection: onLoadChildrenComplete.mock.calls[0][0].collection, ...props });

    expect(rowOf("Remote").getAttribute("data-state")).toBe("open");

    await clickRow("Remote");
    await clickRow("Remote");

    expect(rowOf("Remote").getAttribute("data-state")).toBe("open");
    expect(loadChildren).toHaveBeenCalledTimes(1);
    expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1);
  });

  it("reloads a branch whose children a fresh collection dropped", async () => {
    const loadChildren = vi.fn(() => Promise.resolve(remoteChildren));
    const onLoadChildrenComplete = vi.fn();
    const props = { showSelectAll: false, loadChildren, onLoadChildrenComplete };
    const { rerender } = renderList({ collection: createLazyCollection(), ...props });

    await clickRow("Remote");
    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1));
    rerender({ collection: onLoadChildrenComplete.mock.calls[0][0].collection, ...props });
    expect(screen.getByText("Remote alpha")).toBeTruthy();

    rerender({ collection: createLazyCollection(), ...props });
    expect(screen.queryByText("Remote alpha")).toBeNull();
    expect(rowOf("Remote").getAttribute("data-state")).toBe("closed");

    await clickRow("Remote");

    expect(loadChildren).toHaveBeenCalledTimes(2);
  });

  it("drops a completion whose node left the collection", async () => {
    const load = deferred<TestNode[]>();
    const onLoadChildrenComplete = vi.fn();
    const onExpandedChange = vi.fn();
    const props = {
      showSelectAll: false,
      loadChildren: () => load.promise,
      onLoadChildrenComplete,
      onExpandedChange,
    };
    const { rerender } = renderList({ collection: createLazyCollection(), ...props });

    await clickRow("Remote");
    rerender({ collection: createLazyCollection([{ id: "carrot", label: "Carrot" }]), ...props });
    load.resolve(remoteChildren);
    await flush();

    expect(onLoadChildrenComplete).not.toHaveBeenCalled();
    expect(onExpandedChange).not.toHaveBeenCalled();
  });

  it("aborts pending loads on unmount without reporting an error", async () => {
    const load = deferred<TestNode[]>();
    const loadChildren = vi.fn((_details: TreeViewLoadChildrenDetails<TestNode>) => load.promise);
    const onLoadChildrenComplete = vi.fn();
    const onLoadChildrenError = vi.fn();
    const { unmount } = renderList({
      collection: createLazyCollection(),
      showSelectAll: false,
      loadChildren,
      onLoadChildrenComplete,
      onLoadChildrenError,
    });

    await clickRow("Remote");
    const { signal } = loadChildren.mock.calls[0][0];
    unmount();

    expect(signal.aborted).toBe(true);
    load.reject(new DOMException("Aborted", "AbortError"));
    await flush();
    expect(onLoadChildrenError).not.toHaveBeenCalled();
    expect(onLoadChildrenComplete).not.toHaveBeenCalled();
  });

  it("aborts pending loads when an external query changes", async () => {
    const loadChildren = vi.fn(
      (_details: TreeViewLoadChildrenDetails<TestNode>) => deferred<TestNode[]>().promise,
    );
    const props = {
      collection: createLazyCollection(),
      showSelectAll: false,
      loadChildren,
    };
    const { rerender } = renderList({ ...props, search: { mode: "external", query: "" } });

    await clickRow("Remote");
    const { signal } = loadChildren.mock.calls[0][0];
    rerender({ ...props, search: { mode: "external", query: "rem" } });

    expect(signal.aborted).toBe(true);
    expect(rowOf("Remote").hasAttribute("data-loading")).toBe(false);
  });

  it("blocks keyboard indent into an unloaded branch until its children load", async () => {
    const onCollectionChange = vi.fn();
    const onLoadChildrenComplete = vi.fn();
    const props = {
      ...listOnly,
      loadChildren: () => Promise.resolve(remoteChildren),
      onLoadChildrenComplete,
      onCollectionChange,
    };
    const { rerender } = renderList({ collection: createLazyCollection(), ...props });

    fireEvent.keyDown(rowOf("Carrot"), { key: "ArrowRight", ctrlKey: true });
    expect(onCollectionChange).not.toHaveBeenCalled();

    await clickRow("Remote");
    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1));
    rerender({ collection: onLoadChildrenComplete.mock.calls[0][0].collection, ...props });

    fireEvent.keyDown(rowOf("Carrot"), { key: "ArrowRight", ctrlKey: true });

    expect(onCollectionChange).toHaveBeenCalledTimes(1);
    const next = onCollectionChange.mock.calls[0][0] as TreeCollection<TestNode>;
    expect(next.getNodeChildren(next.findNode("remote") as TestNode).map((n) => n.id)).toEqual([
      "carrot",
      "remote/alpha",
      "remote/beta",
    ]);
  });

  it("keeps a branch that loaded empty loaded after a reorder", async () => {
    const loadChildren = vi.fn(() => Promise.resolve([] as TestNode[]));
    const LazyReorderableTree = () => {
      const [collection, setCollection] = useState(() => createLazyCollection());
      return treeSelectList({
        ...listOnly,
        collection,
        loadChildren,
        onLoadChildrenComplete: ({ collection: next }) => setCollection(next),
        onCollectionChange: setCollection,
      });
    };
    render(<LazyReorderableTree />);

    await clickRow("Remote");
    await waitFor(() => expect(rowOf("Remote").getAttribute("data-state")).toBe("open"));

    fireEvent.keyDown(rowOf("Carrot"), { key: "ArrowUp", ctrlKey: true });
    expect(rowOf("Carrot").getAttribute("data-path")).toBe("2");
    expect(rowOf("Remote").getAttribute("data-state")).toBe("open");

    await clickRow("Remote");
    await clickRow("Remote");

    expect(rowOf("Remote").getAttribute("data-state")).toBe("open");
    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it("never loads unloaded branches when an external search auto-expands", () => {
    const loadChildren = vi.fn(() => Promise.resolve(remoteChildren));
    renderList({
      collection: createLazyCollection(),
      showSelectAll: false,
      loadChildren,
      search: { mode: "external", query: "remote" },
      defaultExpandedValue: [],
    });

    expect(rowOf("Fruits").getAttribute("data-state")).toBe("open");
    expect(rowOf("Remote").getAttribute("data-state")).toBe("closed");
    expect(rowOf("Cloud").getAttribute("data-state")).toBe("closed");
    expect(loadChildren).not.toHaveBeenCalled();
  });
});

const pearCollection = createTestTree([
  {
    id: "fruits",
    label: "Fruits",
    children: [
      { id: "apple", label: "Apple" },
      { id: "banana", label: "Banana" },
    ],
  },
  { id: "pear", label: "Pear" },
]);

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

describe("TreeSelectList pointer drops", () => {
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
    const onCollectionChange = vi.fn();
    const onExpandedChange = vi.fn();
    renderList({
      ...listOnly,
      collection: pearCollection,
      defaultExpandedValue: [],
      onCollectionChange,
      onExpandedChange,
    });

    pointerDrag(rowOf("Pear"), rowOf("Fruits"), 100, 10);
    await flush();

    const next = onCollectionChange.mock.calls[0][0] as TreeCollection<TestNode>;
    expect(next.getNodeChildren(next.findNode("fruits") as TestNode).map((n) => n.id)).toEqual([
      "pear",
      "apple",
      "banana",
    ]);
    expect(onExpandedChange).toHaveBeenLastCalledWith(["fruits"]);
  });

  it("leaves a branch collapsed when canDrop vetoes nesting into it", async () => {
    mockRowRects();
    const onCollectionChange = vi.fn();
    const onExpandedChange = vi.fn();
    renderList({
      ...listOnly,
      collection: pearCollection,
      defaultExpandedValue: [],
      onCollectionChange,
      onExpandedChange,
      canDrop: () => false,
    });

    pointerDrag(rowOf("Pear"), rowOf("Fruits"), 100, 10);
    await flush();

    expect(onCollectionChange).not.toHaveBeenCalled();
    expect(onExpandedChange).not.toHaveBeenCalled();
  });

  it("measures reparent levels from the inline start edge in RTL", () => {
    mockRowRects();
    const onCollectionChange = vi.fn();
    renderList({ ...listOnly, collection: pearCollection, onCollectionChange });
    rowOf("Banana").style.direction = "rtl";

    pointerDrag(rowOf("Apple"), rowOf("Banana"), 195, 15);

    const next = onCollectionChange.mock.calls[0][0] as TreeCollection<TestNode>;
    expect(next.getNodeChildren(next.rootNode).map((n) => n.id)).toEqual([
      "fruits",
      "apple",
      "pear",
    ]);
  });
});
