import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { virtualScrollAreaProps } from "../../_shared/virtualScrollAreaMock";
import {
  childIdsOf,
  findTestNode,
  fruitVegNodes,
  testAccessors,
  type TestNode,
} from "./tree.fixtures";
import { TreeSelectList, type TreeSelectListProps } from "./TreeSelectList";
import type { TreeLoadChildrenDetails } from "./useTreeLazyLoad";
import { useTreeSelectList } from "./useTreeSelectList";

vi.mock("../ScrollArea/VirtualScrollArea", () => import("../../_shared/virtualScrollAreaMock"));

const fileTreeCollection: TestNode[] = [
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
];

interface ItemsNode {
  id: string;
  label: string;
  items?: ItemsNode[];
}

const itemsCollection: ItemsNode[] = [
  {
    id: "fruits",
    label: "Fruits",
    items: [
      { id: "apple", label: "Apple" },
      { id: "banana", label: "Banana" },
    ],
  },
];

const itemsAccessors = {
  getNodeValue: (node: ItemsNode) => node.id,
  getNodeLabel: (node: ItemsNode) => node.label,
  getChildren: (node: ItemsNode) => node.items,
};

type ListProps = Partial<TreeSelectListProps<TestNode>>;

const listOnly = { search: { showInput: false }, showSelectAll: false } satisfies ListProps;

const treeSelectList = ({
  loadChildren,
  onLoadChildrenComplete = () => {},
  onLoadChildrenError,
  ...overrides
}: ListProps = {}) => {
  const props = {
    nodes: fruitVegNodes,
    ...testAccessors,
    value: [],
    onValueChange: vi.fn(),
    ...overrides,
  };
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

const rowOf = (label: string) =>
  screen
    .getByText(label)
    .closest<HTMLElement>('[data-slot="branchControl"], [data-slot="item"]') as HTMLElement;

const checkboxOf = (label: string) => rowOf(label).querySelector('[data-slot="nodeCheckbox"]');

const indicatorOf = (label: string) =>
  rowOf(label).querySelector('[data-slot="branchIndicator"]') as HTMLElement;

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

describe("TreeSelectList", () => {
  // --- Rendering / indent guides (from CheckboxTree tests) ---

  it("renders ancestor indent guides for virtualized descendants", () => {
    renderList({
      ...listOnly,
      nodes: fileTreeCollection,
      defaultExpandedValue: ["src", "src/components"],
    });

    expect(rowOf("src").querySelectorAll(".tree-view__branchIndentGuide")).toHaveLength(0);
    expect(rowOf("components").querySelectorAll(".tree-view__branchIndentGuide")).toHaveLength(1);
    expect(rowOf("Button.tsx").querySelectorAll(".tree-view__branchIndentGuide")).toHaveLength(2);
  });

  it("renders a leaf indicator spacer so item content aligns with branch rows", () => {
    renderList({ ...listOnly, defaultExpandedValue: ["fruits"] });

    expect(rowOf("Fruits").querySelector('[data-slot="branchIndicator"] > svg')).not.toBeNull();
    expect(rowOf("Apple").querySelector(".tree-view__branchIndicator")).not.toBeNull();
  });

  it("renders a single check icon for a fully checked branch", () => {
    renderList({
      ...listOnly,
      nodes: fileTreeCollection,
      value: ["src/components/Button.tsx", "src/components/Input.tsx"],
      defaultExpandedValue: ["src", "src/components"],
    });

    const branchRow = rowOf("components");

    expect(branchRow.querySelectorAll("svg.lucide-check")).toHaveLength(1);
    expect(branchRow.querySelectorAll("svg.lucide-minus")).toHaveLength(0);
    expect(branchRow.querySelectorAll("svg")).toHaveLength(2);
  });

  it("renders an indeterminate icon for a partially checked branch", () => {
    renderList({
      ...listOnly,
      nodes: fileTreeCollection,
      value: ["src/components/Button.tsx"],
      defaultExpandedValue: ["src", "src/components"],
    });

    const branchRow = rowOf("components");

    expect(branchRow.querySelectorAll("svg.lucide-check")).toHaveLength(0);
    expect(branchRow.querySelectorAll("svg.lucide-minus")).toHaveLength(1);
    expect(branchRow.querySelectorAll("svg")).toHaveLength(2);
  });

  // --- Filtering / selection preservation (from TreeSelect tests) ---

  it("preserves hidden selections when a filtered checkbox changes", async () => {
    const onValueChange = vi.fn();

    renderList({ value: ["carrot"], onValueChange });

    fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "app" } });

    fireEvent.click(checkboxOf("Apple") as Element);

    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(["carrot", "apple"]));
  });

  it("hides search and select-all when both are disabled", () => {
    renderList(listOnly);

    expect(screen.queryByPlaceholderText("Search...")).toBeNull();
    expect(screen.queryByLabelText("Select all")).toBeNull();
  });

  // --- Drag and drop ---

  it("makes rows draggable when onNodesChange is provided", () => {
    renderList({
      ...listOnly,
      onNodesChange: vi.fn(),
      defaultExpandedValue: ["fruits", "vegetables"],
    });

    expect(screen.getByText("Fruits").closest("[draggable='true']")).not.toBeNull();
    expect(screen.getByText("Apple").closest("[draggable='true']")).not.toBeNull();
  });

  it("leaves rows non-draggable without onNodesChange", () => {
    renderList({ ...listOnly, defaultExpandedValue: ["fruits", "vegetables"] });

    expect(screen.getByText("Fruits").closest("[draggable='true']")).toBeNull();
  });
});

describe("TreeSelectList sticky branches and rename", () => {
  it("pins the branch of the topmost visible row above the list", async () => {
    renderList({
      ...listOnly,
      nodes: fileTreeCollection,
      defaultExpandedValue: ["src", "src/components"],
      stickyBranches: true,
    });
    const onVisibleItemsChange = virtualScrollAreaProps.current.onVisibleItemsChange as (items: {
      firstVisible: number;
      firstUncut: number;
    }) => void;
    const rowIndex = (label: string) =>
      Array.from(document.querySelectorAll('[data-slot="branchControl"], [data-slot="item"]'))
        .filter((el) => !el.closest("[aria-hidden=true]"))
        .findIndex((el) => el.textContent?.includes(label));

    const inputRow = rowIndex("Input.tsx");
    act(() => onVisibleItemsChange({ firstVisible: inputRow, firstUncut: inputRow }));

    const pinned = document.querySelector<HTMLElement>("[data-pinned]");
    expect(pinned?.textContent).toBe("components");
  });

  it("renames the focused node on F2", async () => {
    const onRenameComplete = vi.fn();
    renderList({
      ...listOnly,
      nodes: fileTreeCollection,
      defaultExpandedValue: ["src", "src/components"],
      canRename: () => true,
      onRenameComplete,
    });
    await clickRow("Button.tsx");

    fireEvent.keyDown(rowOf("Button.tsx"), { key: "F2" });
    const input = await screen.findByDisplayValue("Button.tsx");
    fireEvent.change(input, { target: { value: "Link.tsx" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await flush();

    expect(onRenameComplete).toHaveBeenCalledWith(
      "src/components/Button.tsx",
      expect.objectContaining({ label: "Link.tsx" }),
    );
  });
});

describe("TreeSelectList search", () => {
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

  it("filters a tree that keeps its children under another key", () => {
    render(
      <TreeSelectList
        nodes={itemsCollection}
        {...itemsAccessors}
        value={[]}
        onValueChange={vi.fn()}
        search={{ query: "app" }}
      />,
    );

    expect(screen.getByText("Apple")).toBeTruthy();
    expect(screen.queryByText("Banana")).toBeNull();
  });

  it("applies defaultQuery to an uncontrolled search", () => {
    renderList({ search: { defaultQuery: "ban" } });

    expect((searchInput() as HTMLInputElement).value).toBe("ban");
    expect(screen.getByText("Banana")).toBeTruthy();
    expect(screen.queryByText("Apple")).toBeNull();
  });

  it("renders the nodes unfiltered in external search mode", () => {
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
    expect(rowOf("Fruits").hasAttribute("data-expanded")).toBe(true);
    expect(onExpandedChange).not.toHaveBeenCalled();

    fireEvent.change(searchInput(), { target: { value: "" } });

    expect(screen.queryByText("Apple")).toBeNull();
    expect(rowOf("Fruits").hasAttribute("data-expanded")).toBe(false);
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
    expect(rowOf("Fruits").hasAttribute("data-expanded")).toBe(true);

    fireEvent.change(searchInput(), { target: { value: "a" } });

    expect(rowOf("Fruits").hasAttribute("data-expanded")).toBe(true);
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
    const onNodesChange = vi.fn();
    const { rerender } = renderList({ onNodesChange, search: { query: "a" } });

    expect(screen.getByText("Apple").closest("[draggable='true']")).toBeNull();

    rerender({ onNodesChange, search: { query: "" } });

    expect(screen.getByText("Apple").closest("[draggable='true']")).not.toBeNull();
  });

  it("shows only the rows a node filter keeps, with their branches, and the query narrows them", () => {
    const kept = new Set(["src/components/Button.tsx", "src/index.ts"]);
    const props = { nodes: fileTreeCollection, nodeFilter: (node: TestNode) => kept.has(node.id) };
    const { rerender } = renderList({ ...props, search: { query: "" } });

    expect(screen.getByText("src")).toBeTruthy();
    expect(screen.getByText("components")).toBeTruthy();
    expect(screen.getByText("Button.tsx")).toBeTruthy();
    expect(screen.getByText("index.ts")).toBeTruthy();
    expect(screen.queryByText("Input.tsx")).toBeNull();

    rerender({ ...props, search: { query: "tsx" } });

    expect(screen.getByText("Button.tsx")).toBeTruthy();
    expect(screen.queryByText("Input.tsx")).toBeNull();
    expect(screen.queryByText("index.ts")).toBeNull();
  });

  it("disables dragging while a node filter is set", () => {
    renderList({ onNodesChange: vi.fn(), nodeFilter: (node) => node.id === "apple" });

    expect(screen.getByText("Apple").closest("[draggable='true']")).toBeNull();
  });

  it("counts the whole tree but offers only the bulk actions that change the shown leaves", () => {
    const onValueChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ query }: { query: string }) =>
        useTreeSelectList({
          nodes: fruitVegNodes,
          ...testAccessors,
          value: ["carrot", "stale"],
          onValueChange,
          isNodeCheckable: ({ node }) => node.id !== "banana",
          search: { query },
        }),
      { initialProps: { query: "app" } },
    );

    expect(result.current).toMatchObject({
      selectableCount: 2,
      selectedCount: 1,
      canSelectAll: true,
      canDeselectAll: false,
    });

    rerender({ query: "zzz" });
    expect(result.current).toMatchObject({ canSelectAll: false, canDeselectAll: false });
    result.current.selectAll();
    expect(onValueChange).not.toHaveBeenCalled();
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
    const pantryCollection = [
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
    ];
    renderList({ nodes: pantryCollection, onValueChange, search: { query: "fruit" } });

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

  it("checks a leaf when its row is clicked and expands a branch instead", async () => {
    const onValueChange = vi.fn();
    renderList({ ...listOnly, onValueChange, defaultExpandedValue: [] });

    await clickRow("Fruits");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(rowOf("Fruits").hasAttribute("data-expanded")).toBe(true);

    await clickRow("Apple");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(["apple"]);
  });

  it("checks a branch with Space and leaves Enter to toggle its expansion", async () => {
    const onValueChange = vi.fn();
    renderList({ ...listOnly, onValueChange });

    fireEvent.keyDown(rowOf("Fruits"), { key: "Enter" });
    await flush();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(rowOf("Fruits").hasAttribute("data-expanded")).toBe(false);

    fireEvent.keyDown(rowOf("Fruits"), { key: " " });
    expect(onValueChange).toHaveBeenLastCalledWith(["apple", "banana"]);
  });

  it("leaves keys pressed on a row action to the action", async () => {
    const onValueChange = vi.fn();
    const onNodesChange = vi.fn();
    renderList({
      ...listOnly,
      onValueChange,
      onNodesChange,
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

    expect(rowOf("Fruits").hasAttribute("data-expanded")).toBe(true);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onNodesChange).not.toHaveBeenCalled();
  });

  it("exposes flat branch rows as expandable tree items", () => {
    renderList({ ...listOnly, nodes: fileTreeCollection, defaultExpandedValue: ["src"] });

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

  it("reads a branch as checked once its checkable leaves are", () => {
    renderList({ ...bananaLocked, value: ["apple"] });

    expect(rowOf("Fruits").getAttribute("aria-checked")).toBe("true");
  });

  it("gives no checkbox to a branch without checkable leaves", () => {
    renderList({ ...listOnly, isNodeCheckable: ({ node }) => node.id !== "carrot" });

    expect(checkboxOf("Vegetables")).toBeNull();
    expect(checkboxOf("Fruits")).not.toBeNull();
  });

  it("skips disabled leaves on select-all and branch toggles", () => {
    const onValueChange = vi.fn();
    renderList({
      nodes: [
        {
          id: "fruits",
          label: "Fruits",
          children: [
            { id: "apple", label: "Apple" },
            { id: "banana", label: "Banana", disabled: true },
          ],
        },
      ],
      onValueChange,
      search: { showInput: false },
    });

    fireEvent.click(screen.getByLabelText("Select all"));
    expect(onValueChange).toHaveBeenLastCalledWith(["apple"]);

    fireEvent.click(checkboxOf("Fruits") as Element);
    expect(onValueChange).toHaveBeenLastCalledWith(["apple"]);
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
) => topLevel;

describe("TreeSelectList lazy loading", () => {
  it("renders a childrenCount-only branch collapsed, with a chevron and no checkbox", () => {
    const loadChildren = vi.fn(() => Promise.resolve(remoteChildren));
    renderList({ nodes: createLazyCollection(), showSelectAll: false, loadChildren });

    expect(rowOf("Remote").getAttribute("data-slot")).toBe("branchControl");
    expect(rowOf("Remote").hasAttribute("data-expanded")).toBe(false);
    expect(indicatorOf("Remote")).not.toBeNull();
    expect(checkboxOf("Remote")).toBeNull();
    expect(screen.getByText("Apple")).toBeTruthy();
    expect(loadChildren).not.toHaveBeenCalled();
  });

  it("loads on expand, marks the row busy and ignores clicks while pending", async () => {
    const nodes = createLazyCollection();
    const load = deferred<TestNode[]>();
    const loadChildren = vi.fn(
      (_node: TestNode, _details: TreeLoadChildrenDetails) => load.promise,
    );
    renderList({ nodes, showSelectAll: false, loadChildren });

    await clickRow("Remote");

    expect(loadChildren).toHaveBeenCalledTimes(1);
    const [node, details] = loadChildren.mock.calls[0];
    expect(node).toBe(findTestNode(nodes, "remote"));
    expect(details.indexPath).toEqual([2]);
    expect(details.valuePath).toEqual(["remote"]);
    expect(details.signal.aborted).toBe(false);
    expect(rowOf("Remote").hasAttribute("data-loading")).toBe(true);
    expect(rowOf("Remote").getAttribute("aria-busy")).toBe("true");
    expect(rowOf("Remote").hasAttribute("data-expanded")).toBe(false);

    await clickRow("Remote");

    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it("hands back the full source nodes under a client query, then opens the branch", async () => {
    const load = deferred<TestNode[]>();
    const onLoadChildrenComplete = vi.fn();
    const props = {
      showSelectAll: false,
      loadChildren: () => load.promise,
      onLoadChildrenComplete,
      search: { query: "remote" },
    };
    const { rerender } = renderList({ nodes: createLazyCollection(), ...props });

    expect(screen.queryByText("Apple")).toBeNull();
    await clickRow("Remote");
    load.resolve(remoteChildren);

    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1));
    const next = onLoadChildrenComplete.mock.calls[0][0] as TestNode[];
    expect(findTestNode(next, "apple")).toBeDefined();
    expect(findTestNode(next, "cloud")).toBeDefined();
    expect(childIdsOf(next, "remote")).toEqual(["remote/alpha", "remote/beta"]);
    expect(rowOf("Remote").hasAttribute("data-loading")).toBe(false);

    rerender({ nodes: next, ...props });

    expect(rowOf("Remote").hasAttribute("data-expanded")).toBe(true);
    expect(checkboxOf("Remote alpha")).not.toBeNull();
    expect(checkboxOf("Remote")).not.toBeNull();
  });

  it("opens a loaded branch once the nodes are applied without a query", async () => {
    const onExpandedChange = vi.fn();
    const onLoadChildrenComplete = vi.fn();
    const props = {
      showSelectAll: false,
      loadChildren: () => Promise.resolve(remoteChildren),
      onLoadChildrenComplete,
      onExpandedChange,
    };
    const { rerender } = renderList({ nodes: createLazyCollection(), ...props });

    await clickRow("Remote");

    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1));
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(onExpandedChange).toHaveBeenLastCalledWith(["fruits", "remote"]);

    rerender({ nodes: onLoadChildrenComplete.mock.calls[0][0], ...props });

    expect(rowOf("Remote").hasAttribute("data-expanded")).toBe(true);
    expect(screen.getByText("Remote beta")).toBeTruthy();
  });

  it("merges two loads that resolve in the same tick", async () => {
    const loads = { remote: deferred<TestNode[]>(), cloud: deferred<TestNode[]>() };
    const loadChildren = vi.fn((node: TestNode) => loads[node.id as keyof typeof loads].promise);
    const onLoadChildrenComplete = vi.fn();
    renderList({
      nodes: createLazyCollection(),
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
    const merged = onLoadChildrenComplete.mock.calls[1][0] as TestNode[];
    expect(childIdsOf(merged, "remote")).toHaveLength(2);
    expect(childIdsOf(merged, "cloud")).toHaveLength(1);
  });

  it("opens a loaded branch on top of the expansion its owner kept", async () => {
    const load = deferred<TestNode[]>();
    const onExpandedChange = vi.fn();
    renderList({
      nodes: createLazyCollection(),
      showSelectAll: false,
      loadChildren: () => load.promise,
      expandedValue: ["fruits"],
      onExpandedChange,
    });

    await clickRow("Remote");
    await clickRow("Fruits");
    expect(onExpandedChange).toHaveBeenLastCalledWith([]);

    load.resolve(remoteChildren);

    await waitFor(() => expect(onExpandedChange).toHaveBeenLastCalledWith(["fruits", "remote"]));
  });

  it("reports a rejected load, stays collapsed and retries on the next expand", async () => {
    const nodes = createLazyCollection();
    const error = new Error("boom");
    const loadChildren = vi.fn(() => Promise.reject(error));
    const onLoadChildrenError = vi.fn();
    renderList({ nodes, showSelectAll: false, loadChildren, onLoadChildrenError });

    await clickRow("Remote");

    await waitFor(() => expect(onLoadChildrenError).toHaveBeenCalledTimes(1));
    expect(onLoadChildrenError).toHaveBeenCalledWith(error, {
      node: findTestNode(nodes, "remote"),
      indexPath: [2],
      valuePath: ["remote"],
    });
    expect(rowOf("Remote").hasAttribute("data-loading")).toBe(false);
    expect(rowOf("Remote").hasAttribute("data-expanded")).toBe(false);

    await clickRow("Remote");

    expect(loadChildren).toHaveBeenCalledTimes(2);
  });

  it("opens a branch whose load came back empty and never reloads it", async () => {
    const loadChildren = vi.fn(() => Promise.resolve([] as TestNode[]));
    const onLoadChildrenComplete = vi.fn();
    const props = { showSelectAll: false, loadChildren, onLoadChildrenComplete };
    const { rerender } = renderList({ nodes: createLazyCollection(), ...props });

    await clickRow("Remote");
    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1));
    rerender({ nodes: onLoadChildrenComplete.mock.calls[0][0], ...props });

    expect(rowOf("Remote").hasAttribute("data-expanded")).toBe(true);

    await clickRow("Remote");
    await clickRow("Remote");

    expect(rowOf("Remote").hasAttribute("data-expanded")).toBe(true);
    expect(loadChildren).toHaveBeenCalledTimes(1);
    expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1);
  });

  it("reloads a branch whose children fresh nodes dropped", async () => {
    const loadChildren = vi.fn(() => Promise.resolve(remoteChildren));
    const onLoadChildrenComplete = vi.fn();
    const props = { showSelectAll: false, loadChildren, onLoadChildrenComplete };
    const { rerender } = renderList({ nodes: createLazyCollection(), ...props });

    await clickRow("Remote");
    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1));
    rerender({ nodes: onLoadChildrenComplete.mock.calls[0][0], ...props });
    expect(screen.getByText("Remote alpha")).toBeTruthy();

    rerender({ nodes: createLazyCollection(), ...props });
    expect(screen.queryByText("Remote alpha")).toBeNull();
    expect(rowOf("Remote").hasAttribute("data-expanded")).toBe(false);

    await clickRow("Remote");

    expect(loadChildren).toHaveBeenCalledTimes(2);
  });

  it("drops a completion whose node left the tree", async () => {
    const load = deferred<TestNode[]>();
    const onLoadChildrenComplete = vi.fn();
    const onExpandedChange = vi.fn();
    const props = {
      showSelectAll: false,
      loadChildren: () => load.promise,
      onLoadChildrenComplete,
      onExpandedChange,
    };
    const { rerender } = renderList({ nodes: createLazyCollection(), ...props });

    await clickRow("Remote");
    rerender({ nodes: createLazyCollection([{ id: "carrot", label: "Carrot" }]), ...props });
    load.resolve(remoteChildren);
    await flush();

    expect(onLoadChildrenComplete).not.toHaveBeenCalled();
    expect(onExpandedChange).not.toHaveBeenCalled();
  });

  it("aborts pending loads on unmount without reporting an error", async () => {
    const load = deferred<TestNode[]>();
    const loadChildren = vi.fn(
      (_node: TestNode, _details: TreeLoadChildrenDetails) => load.promise,
    );
    const onLoadChildrenComplete = vi.fn();
    const onLoadChildrenError = vi.fn();
    const { unmount } = renderList({
      nodes: createLazyCollection(),
      showSelectAll: false,
      loadChildren,
      onLoadChildrenComplete,
      onLoadChildrenError,
    });

    await clickRow("Remote");
    const { signal } = loadChildren.mock.calls[0][1];
    unmount();

    expect(signal.aborted).toBe(true);
    load.reject(new DOMException("Aborted", "AbortError"));
    await flush();
    expect(onLoadChildrenError).not.toHaveBeenCalled();
    expect(onLoadChildrenComplete).not.toHaveBeenCalled();
  });

  it("aborts pending loads when an external query changes", async () => {
    const loadChildren = vi.fn(
      (_node: TestNode, _details: TreeLoadChildrenDetails) => deferred<TestNode[]>().promise,
    );
    const props = {
      nodes: createLazyCollection(),
      showSelectAll: false,
      loadChildren,
    };
    const { rerender } = renderList({ ...props, search: { mode: "external", query: "" } });

    await clickRow("Remote");
    const { signal } = loadChildren.mock.calls[0][1];
    rerender({ ...props, search: { mode: "external", query: "rem" } });

    expect(signal.aborted).toBe(true);
    expect(rowOf("Remote").hasAttribute("data-loading")).toBe(false);
  });

  it("blocks keyboard indent into an unloaded branch until its children load", async () => {
    const onNodesChange = vi.fn();
    const onLoadChildrenComplete = vi.fn();
    const props = {
      ...listOnly,
      loadChildren: () => Promise.resolve(remoteChildren),
      onLoadChildrenComplete,
      onNodesChange,
    };
    const { rerender } = renderList({ nodes: createLazyCollection(), ...props });

    fireEvent.keyDown(rowOf("Carrot"), { key: "ArrowRight", ctrlKey: true });
    expect(onNodesChange).not.toHaveBeenCalled();

    await clickRow("Remote");
    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1));
    rerender({ nodes: onLoadChildrenComplete.mock.calls[0][0], ...props });

    fireEvent.keyDown(rowOf("Carrot"), { key: "ArrowRight", ctrlKey: true });

    expect(onNodesChange).toHaveBeenCalledTimes(1);
    const next = onNodesChange.mock.calls[0][0] as TestNode[];
    expect(childIdsOf(next, "remote")).toEqual(["carrot", "remote/alpha", "remote/beta"]);
  });

  it("keeps a branch that loaded empty loaded after a reorder", async () => {
    const loadChildren = vi.fn(() => Promise.resolve([] as TestNode[]));
    const LazyReorderableTree = () => {
      const [nodes, setNodes] = useState(() => createLazyCollection());
      return treeSelectList({
        ...listOnly,
        nodes,
        loadChildren,
        onLoadChildrenComplete: (next) => setNodes(next),
        onNodesChange: setNodes,
      });
    };
    render(<LazyReorderableTree />);

    await clickRow("Remote");
    await waitFor(() => expect(rowOf("Remote").hasAttribute("data-expanded")).toBe(true));

    fireEvent.keyDown(rowOf("Carrot"), { key: "ArrowUp", ctrlKey: true });
    expect(rowOf("Carrot").getAttribute("data-path")).toBe("2");
    expect(rowOf("Remote").hasAttribute("data-expanded")).toBe(true);

    await clickRow("Remote");
    await clickRow("Remote");

    expect(rowOf("Remote").hasAttribute("data-expanded")).toBe(true);
    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it("never loads unloaded branches when an external search auto-expands", () => {
    const loadChildren = vi.fn(() => Promise.resolve(remoteChildren));
    renderList({
      nodes: createLazyCollection(),
      showSelectAll: false,
      loadChildren,
      search: { mode: "external", query: "remote" },
      defaultExpandedValue: [],
    });

    expect(rowOf("Fruits").hasAttribute("data-expanded")).toBe(true);
    expect(rowOf("Remote").hasAttribute("data-expanded")).toBe(false);
    expect(rowOf("Cloud").hasAttribute("data-expanded")).toBe(false);
    expect(loadChildren).not.toHaveBeenCalled();
  });
});
