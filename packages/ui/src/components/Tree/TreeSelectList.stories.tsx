import preview from "@construkt-kit/story-kit/preview";
import { EllipsisIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { type TreeLoadChildrenDetails, TreeSelectList } from ".";
import { useDebounce } from "../../hooks/useDebounce";
import { IconButton } from "../Buttons";
import { Box } from "../Layout";
import { Menu } from "../Menu";

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

function TreeSelectListDemo() {
  const [selected, setSelected] = useState<string[]>(["apple", "lemon"]);

  return (
    <Box
      maxW="400px"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
    >
      <TreeSelectList
        nodes={nodes}
        {...accessors}
        value={selected}
        onValueChange={setSelected}
        listHeight="320px"
      />
    </Box>
  );
}

export const Default = meta.story({
  render: () => <TreeSelectListDemo />,
});

function BareTreeDemo() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Box
      maxW="400px"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
    >
      <TreeSelectList
        nodes={nodes}
        {...accessors}
        value={selected}
        onValueChange={setSelected}
        search={{ showInput: false }}
        showSelectAll={false}
        listHeight="320px"
      />
    </Box>
  );
}

export const WithoutToolbar = meta.story({
  render: () => <BareTreeDemo />,
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

function HoverActionsDemo() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Box
      maxW="320px"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
    >
      <TreeSelectList
        nodes={longLabelNodes}
        {...accessors}
        value={selected}
        onValueChange={setSelected}
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
  );
}

/** Row actions cover the end of long labels only while the row is hovered or focused. */
export const HoverActions = meta.story({
  render: () => <HoverActionsDemo />,
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

function LongListDemo() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Box maxW="400px">
      <TreeSelectList
        nodes={largeNodes}
        {...accessors}
        value={selected}
        onValueChange={setSelected}
        listHeight="480px"
      />
    </Box>
  );
}

export const LongList = meta.story({
  render: () => <LongListDemo />,
});

function StickyBranchesDemo() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Box maxW="400px">
      <TreeSelectList
        nodes={largeNodes}
        {...accessors}
        value={selected}
        onValueChange={setSelected}
        listHeight="360px"
        stickyBranches
      />
    </Box>
  );
}

/** The branch of the topmost visible row stays pinned above the list; click it to jump back. */
export const StickyBranches = meta.story({
  render: () => <StickyBranchesDemo />,
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
