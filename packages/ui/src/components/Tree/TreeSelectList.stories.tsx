import preview from "@construkt-kit/story-kit/preview";
import { EllipsisIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  type TreeLoadChildrenDetails,
  TreeSelectList,
  type TreeSelectListProps,
  useTreeSelectList,
} from ".";
import { useDebounce } from "../../hooks/useDebounce";
import { Button, IconButton } from "../Buttons";
import { Box, HStack, Stack } from "../Layout";
import { Menu } from "../Menu";
import { SegmentGroup } from "../SegmentGroup";
import { Text } from "../Text";

const meta = preview.meta({
  title: "Components/TreeSelectList",
  tags: ["autodocs"],
});

interface DemoNode {
  id: string;
  label: string;
  children?: DemoNode[];
}

const accessors = {
  getNodeValue: (node: { id: string }) => node.id,
  getNodeLabel: (node: { label: string }) => node.label,
};

const nodes: DemoNode[] = [
  {
    id: "fruits",
    label: "Fruits",
    children: [
      { id: "apple", label: "Apple" },
      { id: "banana", label: "Banana" },
      {
        id: "citrus",
        label: "Citrus",
        children: [
          { id: "orange", label: "Orange" },
          { id: "lemon", label: "Lemon" },
        ],
      },
    ],
  },
  {
    id: "vegetables",
    label: "Vegetables",
    children: [
      { id: "carrot", label: "Carrot" },
      { id: "broccoli", label: "Broccoli" },
      { id: "spinach", label: "Spinach" },
    ],
  },
];

type ListDemoProps = Omit<
  TreeSelectListProps<DemoNode>,
  | "value"
  | "onValueChange"
  | keyof typeof accessors
  | "loadChildren"
  | "onLoadChildrenComplete"
  | "onLoadChildrenError"
> & { defaultValue?: string[] };

function ListDemo({ defaultValue = [], ...props }: ListDemoProps) {
  const [selected, setSelected] = useState(defaultValue);

  return (
    <TreeSelectList
      {...props}
      {...accessors}
      value={selected}
      onValueChange={setSelected}
    />
  );
}

export const Default = meta.story({
  render: () => (
    <Box
      maxW="400px"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
    >
      <ListDemo
        nodes={nodes}
        defaultValue={["apple", "lemon"]}
        listHeight="320px"
      />
    </Box>
  ),
});

function CustomHeaderDemo() {
  const [selected, setSelected] = useState<string[]>(["apple", "lemon"]);
  const [view, setView] = useState("all");
  const isPicked = useCallback((node: DemoNode) => selected.includes(node.id), [selected]);
  const list = useTreeSelectList({
    nodes,
    ...accessors,
    value: selected,
    onValueChange: setSelected,
    nodeFilter: view === "picked" ? isPicked : undefined,
  });

  return (
    <Stack
      maxW="400px"
      gap="3"
    >
      <Box
        borderWidth="1px"
        borderColor="border"
        borderRadius="lg"
      >
        <TreeSelectList.RootProvider value={list}>
          <TreeSelectList.Search showSelectAll={false} />
          <HStack
            justify="space-between"
            px="2"
            mb="1"
          >
            <HStack gap="1">
              <Button
                size="xs"
                variant="plain"
                disabled={!list.canSelectAll}
                onClick={list.selectAll}
              >
                Select all
              </Button>
              <Button
                size="xs"
                variant="plain"
                disabled={!list.canDeselectAll}
                onClick={list.deselectAll}
              >
                Deselect all
              </Button>
            </HStack>
            <SegmentGroup.Root
              size="xs"
              aria-label="Rows shown"
              value={view}
              onValueChange={(next) => setView(next ?? "all")}
            >
              <SegmentGroup.Indicator />
              <SegmentGroup.Items
                items={[
                  { value: "all", label: "All" },
                  { value: "picked", label: "Picked" },
                ]}
              />
            </SegmentGroup.Root>
          </HStack>
          <TreeSelectList.Tree />
        </TreeSelectList.RootProvider>
      </Box>
      <Text color="fg.muted">
        {list.selectedCount} of {list.selectableCount} selected
      </Text>
    </Stack>
  );
}

/**
 * `useTreeSelectList` with the list's parts: bulk actions that turn off when they would do
 * nothing, a Picked view that shows only the selected rows, and a count outside the list.
 */
export const CustomHeader = meta.story({
  render: () => <CustomHeaderDemo />,
});

export const WithoutToolbar = meta.story({
  render: () => (
    <Box
      maxW="400px"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
    >
      <ListDemo
        nodes={nodes}
        search={{ showInput: false }}
        showSelectAll={false}
        listHeight="320px"
      />
    </Box>
  ),
});

const longLabelNodes: DemoNode[] = [
  {
    id: "reports",
    label: "Quarterly reports shared with the leadership team",
    children: [
      { id: "q1", label: "Q1 performance review with regional breakdowns" },
      { id: "q2", label: "Q2 performance review" },
      { id: "q3", label: "Q3 performance review with the revised forecast and commentary" },
    ],
  },
];

/** Row actions cover the end of long labels only while the row is hovered or focused. */
export const HoverActions = meta.story({
  render: () => (
    <Box
      maxW="320px"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
    >
      <ListDemo
        nodes={longLabelNodes}
        search={{ showInput: false }}
        showSelectAll={false}
        listHeight="200px"
        actionsVisibility="hover"
        renderActions={({ node }) => (
          <Menu.Root>
            <Menu.Trigger
              render={
                <IconButton
                  aria-label={`Actions for ${node.label}`}
                  size="2xs"
                  variant="plain"
                />
              }
            >
              <EllipsisIcon />
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item value="rename">Rename</Menu.Item>
              <Menu.Item value="duplicate">Duplicate</Menu.Item>
              <Menu.Item value="delete">Delete</Menu.Item>
            </Menu.Content>
          </Menu.Root>
        )}
      />
    </Box>
  ),
});

// --- Long list for virtual scroll testing ---

function generateLargeTree(): DemoNode[] {
  const categories: DemoNode[] = [];
  for (let c = 1; c <= 20; c++) {
    const subcategories: DemoNode[] = [];
    for (let s = 1; s <= 5; s++) {
      const items: DemoNode[] = [];
      for (let i = 1; i <= 10; i++) {
        items.push({ id: `c${c}-s${s}-item${i}`, label: `Item ${i}` });
      }
      subcategories.push({
        id: `c${c}-sub${s}`,
        label: `Subcategory ${s}`,
        children: items,
      });
    }
    categories.push({
      id: `category-${c}`,
      label: `Category ${c}`,
      children: subcategories,
    });
  }
  return categories;
}

const largeNodes = generateLargeTree();

export const LongList = meta.story({
  render: () => (
    <Box maxW="400px">
      <ListDemo
        nodes={largeNodes}
        listHeight="480px"
      />
    </Box>
  ),
});

/** The branch of the topmost visible row stays pinned above the list; click it to jump back. */
export const StickyBranches = meta.story({
  render: () => (
    <Box maxW="400px">
      <ListDemo
        nodes={largeNodes}
        listHeight="360px"
        stickyBranches
      />
    </Box>
  ),
});

const renameNode = (list: DemoNode[], id: string, label: string): DemoNode[] =>
  list.map((node) =>
    node.id === id
      ? { ...node, label }
      : node.children
        ? { ...node, children: renameNode(node.children, id, label) }
        : node,
  );

function RenameDemo() {
  const [tree, setTree] = useState(nodes);
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Box maxW="400px">
      <TreeSelectList
        nodes={tree}
        {...accessors}
        value={selected}
        onValueChange={setSelected}
        canRename={({ isBranch }) => !isBranch}
        onRenameComplete={(value, { label }) => setTree(renameNode(tree, value, label))}
      />
    </Box>
  );
}

/** Focus a leaf and press F2 to rename it; Enter saves, Escape cancels. */
export const Rename = meta.story({
  render: () => <RenameDemo />,
});

interface LazyDemoNode {
  id: string;
  label: string;
  childrenCount?: number;
  children?: LazyDemoNode[];
}

const lazyNodes: LazyDemoNode[] = [
  { id: "engineering", label: "Engineering", childrenCount: 3 },
  { id: "design", label: "Design", childrenCount: 2 },
  { id: "sales", label: "Sales", childrenCount: 4 },
];

const delay = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

const loadTeam = async (
  node: LazyDemoNode,
  { valuePath, signal }: TreeLoadChildrenDetails,
): Promise<LazyDemoNode[]> => {
  await delay(800, signal);
  const isTeam = valuePath.length > 1;

  return Array.from({ length: node.childrenCount ?? 0 }, (_, index) => {
    const id = `${node.id}/${index + 1}`;
    return isTeam
      ? { id, label: `${node.label} member ${index + 1}` }
      : { id, label: `${node.label} team ${index + 1}`, childrenCount: 2 };
  });
};

function LazyLoadingDemo() {
  const [teams, setTeams] = useState(lazyNodes);
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Box
      maxW="400px"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
    >
      <TreeSelectList
        nodes={teams}
        {...accessors}
        value={selected}
        onValueChange={setSelected}
        loadChildren={loadTeam}
        onLoadChildrenComplete={setTeams}
        listHeight="320px"
      />
    </Box>
  );
}

export const LazyLoading = meta.story({
  render: () => <LazyLoadingDemo />,
});

const filterNodes = (list: DemoNode[], matches: (node: DemoNode) => boolean): DemoNode[] =>
  list.flatMap((node) => {
    const children = filterNodes(node.children ?? [], matches);
    if (!children.length && !matches(node)) return [];
    return [node.children ? { ...node, children } : node];
  });

const searchServer = async (query: string, signal: AbortSignal) => {
  await delay(400, signal);
  const normalized = query.trim().toLowerCase();
  if (!normalized) return nodes;
  return filterNodes(nodes, (node) => node.label.toLowerCase().includes(normalized));
};

function ExternalSearchDemo() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useDebounce(() => setDebouncedQuery(query), 300, [query]);
  const [results, setResults] = useState(nodes);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    searchServer(debouncedQuery, controller.signal).then(setResults, () => {});
    return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <Box
      maxW="400px"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
    >
      <TreeSelectList
        nodes={results}
        {...accessors}
        value={selected}
        onValueChange={setSelected}
        search={{ mode: "external", query, onQueryChange: setQuery }}
        listHeight="320px"
      />
    </Box>
  );
}

export const ExternalSearch = meta.story({
  render: () => <ExternalSearchDemo />,
});
