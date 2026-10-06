import type {
  TreeCollection,
  TreeViewLoadChildrenCompleteDetails,
  TreeViewLoadChildrenDetails,
  TreeViewLoadChildrenErrorDetails,
} from "@ark-ui/react/tree-view";
import { createTreeCollection } from "@ark-ui/react/tree-view";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

  it("preserves hidden selections when a filtered checkbox changes", async () => {
    const onValueChange = vi.fn();

    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={["carrot"]}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "app" } });

    const appleCheckbox = screen
      .getByText("Apple")
      .closest('[data-scope="tree-view"][data-part="item"]')
      ?.querySelector('[data-scope="tree-view"][data-part="node-checkbox"]');
    fireEvent.click(appleCheckbox as Element);

    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(["carrot", "apple"]));
  });

  it("defaults to md size", () => {
    const { container } = render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
      />,
    );

    expect(container.querySelector('[class*="tree-view__root--size_md"]')).not.toBeNull();
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

  // --- Drag and drop ---

  it("makes rows draggable when onCollectionChange is provided", () => {
    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
        onCollectionChange={vi.fn()}
        defaultExpandedValue={["fruits", "vegetables"]}
        showSearch={false}
        showSelectAll={false}
      />,
    );

    expect(screen.getByText("Fruits").closest("[draggable='true']")).not.toBeNull();
    expect(screen.getByText("Apple").closest("[draggable='true']")).not.toBeNull();
  });

  it("leaves rows non-draggable without onCollectionChange", () => {
    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
        defaultExpandedValue={["fruits", "vegetables"]}
        showSearch={false}
        showSelectAll={false}
      />,
    );

    expect(screen.getByText("Fruits").closest("[draggable='true']")).toBeNull();
  });

  it("reorders a node via keyboard (Ctrl+ArrowDown) and commits the change", () => {
    const onCollectionChange = vi.fn();
    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
        onCollectionChange={onCollectionChange}
        defaultExpandedValue={["fruits", "vegetables"]}
        showSearch={false}
        showSelectAll={false}
      />,
    );

    const apple = screen.getByText("Apple").closest("[draggable='true']");
    expect(apple).not.toBeNull();
    fireEvent.keyDown(apple as HTMLElement, { key: "ArrowDown", ctrlKey: true });

    expect(onCollectionChange).toHaveBeenCalledTimes(1);
    const next = onCollectionChange.mock.calls[0][0] as TreeCollection<DemoNode>;
    expect(next.getNodeChildren(next.findNode("fruits") as DemoNode).map((n) => n.id)).toEqual([
      "banana",
      "apple",
    ]);
  });

  it("keyboard reorder respects the canDrop veto", () => {
    const onCollectionChange = vi.fn();
    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
        onCollectionChange={onCollectionChange}
        canDrop={() => false}
        defaultExpandedValue={["fruits", "vegetables"]}
        showSearch={false}
        showSelectAll={false}
      />,
    );
    const apple = screen.getByText("Apple").closest("[draggable='true']");
    fireEvent.keyDown(apple as HTMLElement, { key: "ArrowDown", ctrlKey: true });
    expect(onCollectionChange).not.toHaveBeenCalled();
  });

  it("keyboard outdent respects blockReparent", () => {
    const onCollectionChange = vi.fn();
    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
        onCollectionChange={onCollectionChange}
        blockReparent
        defaultExpandedValue={["fruits", "vegetables"]}
        showSearch={false}
        showSelectAll={false}
      />,
    );
    const carrot = screen.getByText("Carrot").closest("[draggable='true']");
    fireEvent.keyDown(carrot as HTMLElement, { key: "ArrowLeft", ctrlKey: true });
    expect(onCollectionChange).not.toHaveBeenCalled();
  });

  it("keyboard reorder respects isNodeDraggable", () => {
    const onCollectionChange = vi.fn();
    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
        onCollectionChange={onCollectionChange}
        isNodeDraggable={() => false}
        defaultExpandedValue={["fruits", "vegetables"]}
        showSearch={false}
        showSelectAll={false}
      />,
    );
    const apple = screen.getByText("Apple").closest("[draggable='true']");
    fireEvent.keyDown(apple as HTMLElement, { key: "ArrowDown", ctrlKey: true });
    expect(onCollectionChange).not.toHaveBeenCalled();
  });

  it("renders an assistive-tech live region when DnD is enabled", async () => {
    const { container } = render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
        onCollectionChange={vi.fn()}
        showSearch={false}
        showSelectAll={false}
      />,
    );

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
    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
      />,
    );

    expect(virtualScrollAreaProps.current.scrollbars).toBe("vertical");
  });

  it("filters by a controlled query and only reports typing until the prop changes", () => {
    const onQueryChange = vi.fn();
    const { rerender } = render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
        query="app"
        onQueryChange={onQueryChange}
      />,
    );

    expect(screen.getByText("Fruits")).toBeTruthy();
    expect(screen.getByText("Apple")).toBeTruthy();
    expect(screen.queryByText("Banana")).toBeNull();
    expect(screen.queryByText("Vegetables")).toBeNull();

    fireEvent.change(searchInput(), { target: { value: "carr" } });

    expect(onQueryChange).toHaveBeenCalledWith("carr");
    expect((searchInput() as HTMLInputElement).value).toBe("app");
    expect(screen.getByText("Apple")).toBeTruthy();
    expect(screen.queryByText("Carrot")).toBeNull();

    rerender(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
        query="carr"
        onQueryChange={onQueryChange}
      />,
    );

    expect(screen.getByText("Carrot")).toBeTruthy();
    expect(screen.queryByText("Apple")).toBeNull();
  });

  it("applies defaultQuery to an uncontrolled search", () => {
    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
        defaultQuery="ban"
      />,
    );

    expect((searchInput() as HTMLInputElement).value).toBe("ban");
    expect(screen.getByText("Banana")).toBeTruthy();
    expect(screen.queryByText("Apple")).toBeNull();
  });

  it("renders the collection unfiltered in external search mode", () => {
    const searchPredicate = vi.fn(() => false);
    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
        searchMode="external"
        query="zzz"
        searchPredicate={searchPredicate}
      />,
    );

    expect(screen.getByText("Apple")).toBeTruthy();
    expect(screen.getByText("Banana")).toBeTruthy();
    expect(screen.getByText("Carrot")).toBeTruthy();
    expect(searchPredicate).not.toHaveBeenCalled();
  });

  it("auto-expands matches during a query without reporting expansion", () => {
    const onExpandedChange = vi.fn();
    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
        defaultExpandedValue={[]}
        onExpandedChange={onExpandedChange}
      />,
    );

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
    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
        defaultExpandedValue={[]}
        onExpandedChange={onExpandedChange}
      />,
    );

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
    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={vi.fn()}
        defaultExpandedValue={[]}
        onExpandedChange={onExpandedChange}
        expandOnSearch={false}
      />,
    );

    fireEvent.change(searchInput(), { target: { value: "app" } });

    expect(screen.getByText("Fruits")).toBeTruthy();
    expect(screen.queryByText("Apple")).toBeNull();

    await clickRow("Fruits");

    expect(screen.getByText("Apple")).toBeTruthy();
    expect(onExpandedChange).toHaveBeenLastCalledWith(["fruits"]);
  });

  it("disables dragging while a query is active", () => {
    const props = {
      collection: fruitVegCollection,
      value: [],
      onValueChange: vi.fn(),
      onCollectionChange: vi.fn(),
    };
    const { rerender } = render(
      <TreeSelectList
        {...props}
        query="a"
      />,
    );

    expect(screen.getByText("Apple").closest("[draggable='true']")).toBeNull();

    rerender(
      <TreeSelectList
        {...props}
        query=""
      />,
    );

    expect(screen.getByText("Apple").closest("[draggable='true']")).not.toBeNull();
  });

  it("selects and deselects only the displayed leaves during a query", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={["carrot"]}
        onValueChange={onValueChange}
        query="app"
      />,
    );

    fireEvent.click(screen.getByLabelText("Select all"));
    expect(onValueChange).toHaveBeenLastCalledWith(["carrot", "apple"]);

    rerender(
      <TreeSelectList
        collection={fruitVegCollection}
        value={["carrot", "apple"]}
        onValueChange={onValueChange}
        query="app"
      />,
    );

    fireEvent.click(screen.getByLabelText("Deselect all"));
    expect(onValueChange).toHaveBeenLastCalledWith(["carrot"]);
  });

  it("never selects a matching branch whose children the query filtered out", () => {
    const onValueChange = vi.fn();
    render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={[]}
        onValueChange={onValueChange}
        query="fruit"
      />,
    );

    fireEvent.click(screen.getByLabelText("Select all"));
    expect(onValueChange).not.toHaveBeenCalledWith(expect.arrayContaining(["fruits"]));
  });

  it("keeps unknown ids on select-all and deselect-all without a query", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <TreeSelectList
        collection={fruitVegCollection}
        value={["stale"]}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByLabelText("Select all"));
    expect(onValueChange).toHaveBeenLastCalledWith(["stale", "apple", "banana", "carrot"]);

    rerender(
      <TreeSelectList
        collection={fruitVegCollection}
        value={["stale", "apple", "banana", "carrot"]}
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(screen.getByLabelText("Deselect all"));
    expect(onValueChange).toHaveBeenLastCalledWith(["stale"]);
  });
});

interface LazyNode {
  id: string;
  label: string;
  childrenCount?: number;
  children?: LazyNode[];
}

const remoteChildren: LazyNode[] = [
  { id: "remote/alpha", label: "Remote alpha" },
  { id: "remote/beta", label: "Remote beta" },
];

const createLazyCollection = (topLevel?: LazyNode[]) =>
  createTreeCollection<LazyNode>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.label,
    rootNode: {
      id: "ROOT",
      label: "",
      children: topLevel ?? [
        { id: "fruits", label: "Fruits", children: [{ id: "apple", label: "Apple" }] },
        { id: "cloud", label: "Cloud", childrenCount: 1 },
        { id: "remote", label: "Remote", childrenCount: 2 },
        { id: "carrot", label: "Carrot" },
      ],
    },
  });

type LazyTreeProps = Omit<
  TreeSelectListProps<LazyNode>,
  "value" | "onValueChange" | "loadChildren" | "onLoadChildrenComplete" | "onLoadChildrenError"
> & {
  loadChildren: (details: TreeViewLoadChildrenDetails<LazyNode>) => Promise<LazyNode[]>;
  onLoadChildrenComplete?: (details: TreeViewLoadChildrenCompleteDetails<LazyNode>) => void;
  onLoadChildrenError?: (details: TreeViewLoadChildrenErrorDetails<LazyNode>) => void;
};

const LazyTree = ({ loadChildren, onLoadChildrenComplete, ...props }: LazyTreeProps) => (
  <TreeSelectList
    value={[]}
    onValueChange={() => {}}
    showSelectAll={false}
    loadChildren={loadChildren}
    onLoadChildrenComplete={onLoadChildrenComplete ?? (() => {})}
    {...props}
  />
);

describe("TreeSelectList lazy loading", () => {
  it("renders a childrenCount-only branch collapsed, with a chevron and no checkbox", () => {
    const loadChildren = vi.fn(() => Promise.resolve(remoteChildren));
    render(
      <LazyTree
        collection={createLazyCollection()}
        loadChildren={loadChildren}
      />,
    );

    expect(rowOf("Remote").getAttribute("data-part")).toBe("branch-control");
    expect(rowOf("Remote").getAttribute("data-state")).toBe("closed");
    expect(indicatorOf("Remote")).not.toBeNull();
    expect(checkboxOf("Remote")).toBeNull();
    expect(screen.getByText("Apple")).toBeTruthy();
    expect(loadChildren).not.toHaveBeenCalled();
  });

  it("loads on expand, marks the row busy and ignores clicks while pending", async () => {
    const collection = createLazyCollection();
    const load = deferred<LazyNode[]>();
    const loadChildren = vi.fn((_details: TreeViewLoadChildrenDetails<LazyNode>) => load.promise);
    render(
      <LazyTree
        collection={collection}
        loadChildren={loadChildren}
      />,
    );

    await clickRow("Remote");

    expect(loadChildren).toHaveBeenCalledTimes(1);
    const [details] = loadChildren.mock.calls[0];
    expect(details.node).toBe(collection.findNode("remote"));
    expect(details.indexPath).toEqual([2]);
    expect(details.valuePath).toEqual(["remote"]);
    expect(details.signal.aborted).toBe(false);
    expect(rowOf("Remote").hasAttribute("data-loading")).toBe(true);
    expect(rowOf("Remote").getAttribute("aria-busy")).toBe("true");
    expect(indicatorOf("Remote").hasAttribute("data-loading")).toBe(true);
    expect(rowOf("Remote").getAttribute("data-state")).toBe("closed");

    await clickRow("Remote");

    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it("hands back the full source collection under a client query, then opens the branch", async () => {
    const load = deferred<LazyNode[]>();
    const onLoadChildrenComplete = vi.fn();
    const props = { loadChildren: () => load.promise, onLoadChildrenComplete, query: "remote" };
    const { rerender } = render(
      <LazyTree
        collection={createLazyCollection()}
        {...props}
      />,
    );

    expect(screen.queryByText("Apple")).toBeNull();
    await clickRow("Remote");
    load.resolve(remoteChildren);

    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1));
    const { collection: next } = onLoadChildrenComplete.mock.calls[0][0] as {
      collection: TreeCollection<LazyNode>;
    };
    expect(next.findNode("apple")).toBeDefined();
    expect(next.findNode("cloud")).toBeDefined();
    expect(next.getNodeChildren(next.findNode("remote") as LazyNode).map((n) => n.id)).toEqual([
      "remote/alpha",
      "remote/beta",
    ]);
    expect(rowOf("Remote").hasAttribute("data-loading")).toBe(false);

    rerender(
      <LazyTree
        collection={next}
        {...props}
      />,
    );

    expect(rowOf("Remote").getAttribute("data-state")).toBe("open");
    expect(checkboxOf("Remote alpha")).not.toBeNull();
    expect(checkboxOf("Remote")).not.toBeNull();
  });

  it("opens a loaded branch once the collection is applied without a query", async () => {
    const onExpandedChange = vi.fn();
    const onLoadChildrenComplete = vi.fn();
    const props = {
      loadChildren: () => Promise.resolve(remoteChildren),
      onLoadChildrenComplete,
      onExpandedChange,
    };
    const { rerender } = render(
      <LazyTree
        collection={createLazyCollection()}
        {...props}
      />,
    );

    await clickRow("Remote");

    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1));
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(onExpandedChange).toHaveBeenLastCalledWith(["fruits", "remote"]);

    rerender(
      <LazyTree
        collection={onLoadChildrenComplete.mock.calls[0][0].collection}
        {...props}
      />,
    );

    expect(rowOf("Remote").getAttribute("data-state")).toBe("open");
    expect(screen.getByText("Remote beta")).toBeTruthy();
  });

  it("merges two loads that resolve in the same tick", async () => {
    const loads = { remote: deferred<LazyNode[]>(), cloud: deferred<LazyNode[]>() };
    const loadChildren = vi.fn(
      ({ node }: TreeViewLoadChildrenDetails<LazyNode>) =>
        loads[node.id as keyof typeof loads].promise,
    );
    const onLoadChildrenComplete = vi.fn();
    render(
      <LazyTree
        collection={createLazyCollection()}
        loadChildren={loadChildren}
        onLoadChildrenComplete={onLoadChildrenComplete}
      />,
    );

    await clickRow("Remote");
    await clickRow("Cloud");
    expect(loadChildren).toHaveBeenCalledTimes(2);

    loads.remote.resolve(remoteChildren);
    loads.cloud.resolve([{ id: "cloud/a", label: "Cloud a" }]);

    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(2));
    const { collection: merged } = onLoadChildrenComplete.mock.calls[1][0] as {
      collection: TreeCollection<LazyNode>;
    };
    expect(merged.getNodeChildren(merged.findNode("remote") as LazyNode)).toHaveLength(2);
    expect(merged.getNodeChildren(merged.findNode("cloud") as LazyNode)).toHaveLength(1);
  });

  it("reports a rejected load, stays collapsed and retries on the next expand", async () => {
    const collection = createLazyCollection();
    const error = new Error("boom");
    const loadChildren = vi.fn(() => Promise.reject(error));
    const onLoadChildrenError = vi.fn();
    render(
      <LazyTree
        collection={collection}
        loadChildren={loadChildren}
        onLoadChildrenError={onLoadChildrenError}
      />,
    );

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
    const loadChildren = vi.fn(() => Promise.resolve([] as LazyNode[]));
    const onLoadChildrenComplete = vi.fn();
    const props = { loadChildren, onLoadChildrenComplete };
    const { rerender } = render(
      <LazyTree
        collection={createLazyCollection()}
        {...props}
      />,
    );

    await clickRow("Remote");
    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1));
    rerender(
      <LazyTree
        collection={onLoadChildrenComplete.mock.calls[0][0].collection}
        {...props}
      />,
    );

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
    const props = { loadChildren, onLoadChildrenComplete };
    const { rerender } = render(
      <LazyTree
        collection={createLazyCollection()}
        {...props}
      />,
    );

    await clickRow("Remote");
    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1));
    rerender(
      <LazyTree
        collection={onLoadChildrenComplete.mock.calls[0][0].collection}
        {...props}
      />,
    );
    expect(screen.getByText("Remote alpha")).toBeTruthy();

    rerender(
      <LazyTree
        collection={createLazyCollection()}
        {...props}
      />,
    );
    expect(screen.queryByText("Remote alpha")).toBeNull();
    expect(rowOf("Remote").getAttribute("data-state")).toBe("closed");

    await clickRow("Remote");

    expect(loadChildren).toHaveBeenCalledTimes(2);
  });

  it("drops a completion whose node left the collection", async () => {
    const load = deferred<LazyNode[]>();
    const onLoadChildrenComplete = vi.fn();
    const onExpandedChange = vi.fn();
    const props = { loadChildren: () => load.promise, onLoadChildrenComplete, onExpandedChange };
    const { rerender } = render(
      <LazyTree
        collection={createLazyCollection()}
        {...props}
      />,
    );

    await clickRow("Remote");
    rerender(
      <LazyTree
        collection={createLazyCollection([{ id: "carrot", label: "Carrot" }])}
        {...props}
      />,
    );
    load.resolve(remoteChildren);
    await flush();

    expect(onLoadChildrenComplete).not.toHaveBeenCalled();
    expect(onExpandedChange).not.toHaveBeenCalled();
  });

  it("aborts pending loads on unmount without reporting an error", async () => {
    const load = deferred<LazyNode[]>();
    const loadChildren = vi.fn((_details: TreeViewLoadChildrenDetails<LazyNode>) => load.promise);
    const onLoadChildrenComplete = vi.fn();
    const onLoadChildrenError = vi.fn();
    const { unmount } = render(
      <LazyTree
        collection={createLazyCollection()}
        loadChildren={loadChildren}
        onLoadChildrenComplete={onLoadChildrenComplete}
        onLoadChildrenError={onLoadChildrenError}
      />,
    );

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
      (_details: TreeViewLoadChildrenDetails<LazyNode>) => deferred<LazyNode[]>().promise,
    );
    const props = {
      collection: createLazyCollection(),
      loadChildren,
      searchMode: "external" as const,
    };
    const { rerender } = render(
      <LazyTree
        {...props}
        query=""
      />,
    );

    await clickRow("Remote");
    const { signal } = loadChildren.mock.calls[0][0];
    rerender(
      <LazyTree
        {...props}
        query="rem"
      />,
    );

    expect(signal.aborted).toBe(true);
    expect(rowOf("Remote").hasAttribute("data-loading")).toBe(false);
  });

  it("blocks keyboard indent into an unloaded branch until its children load", async () => {
    const onCollectionChange = vi.fn();
    const onLoadChildrenComplete = vi.fn();
    const props = {
      loadChildren: () => Promise.resolve(remoteChildren),
      onLoadChildrenComplete,
      onCollectionChange,
      showSearch: false,
    };
    const { rerender } = render(
      <LazyTree
        collection={createLazyCollection()}
        {...props}
      />,
    );

    fireEvent.keyDown(rowOf("Carrot"), { key: "ArrowRight", ctrlKey: true });
    expect(onCollectionChange).not.toHaveBeenCalled();

    await clickRow("Remote");
    await waitFor(() => expect(onLoadChildrenComplete).toHaveBeenCalledTimes(1));
    rerender(
      <LazyTree
        collection={onLoadChildrenComplete.mock.calls[0][0].collection}
        {...props}
      />,
    );

    fireEvent.keyDown(rowOf("Carrot"), { key: "ArrowRight", ctrlKey: true });

    expect(onCollectionChange).toHaveBeenCalledTimes(1);
    const next = onCollectionChange.mock.calls[0][0] as TreeCollection<LazyNode>;
    expect(next.getNodeChildren(next.findNode("remote") as LazyNode).map((n) => n.id)).toEqual([
      "remote/alpha",
      "remote/beta",
      "carrot",
    ]);
  });

  it("never loads unloaded branches when an external search auto-expands", () => {
    const loadChildren = vi.fn(() => Promise.resolve(remoteChildren));
    render(
      <LazyTree
        collection={createLazyCollection()}
        loadChildren={loadChildren}
        searchMode="external"
        query="remote"
        defaultExpandedValue={[]}
      />,
    );

    expect(rowOf("Fruits").getAttribute("data-state")).toBe("open");
    expect(rowOf("Remote").getAttribute("data-state")).toBe("closed");
    expect(rowOf("Cloud").getAttribute("data-state")).toBe("closed");
    expect(loadChildren).not.toHaveBeenCalled();
  });
});
