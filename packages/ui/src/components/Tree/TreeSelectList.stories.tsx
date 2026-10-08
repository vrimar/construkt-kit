import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";

import { type TreeViewLoadChildrenDetails, TreeSelectList, createTreeCollection } from ".";
import { useDebounceQuery } from "../../hooks";
import { Box } from "../Layout";

const meta: Meta = {
  title: "Components/TreeSelectList",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

interface DemoNode {
  id: string;
  label: string;
  children?: DemoNode[];
}

const collection = createTreeCollection<DemoNode>({
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
    ],
  },
});

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
        collection={collection}
        value={selected}
        onValueChange={setSelected}
        listHeight="320px"
      />
    </Box>
  );
}

export const Default: Story = {
  render: () => <TreeSelectListDemo />,
};

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
        collection={collection}
        value={selected}
        onValueChange={setSelected}
        search={{ showInput: false }}
        showSelectAll={false}
        listHeight="320px"
      />
    </Box>
  );
}

export const WithoutToolbar: Story = {
  render: () => <BareTreeDemo />,
};

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

const largeCollection = createTreeCollection<DemoNode>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.label,
  rootNode: {
    id: "ROOT",
    label: "",
    children: generateLargeTree(),
  },
});

function LongListDemo() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Box maxW="400px">
      <TreeSelectList
        collection={largeCollection}
        value={selected}
        onValueChange={setSelected}
        listHeight="480px"
      />
    </Box>
  );
}

export const LongList: Story = {
  render: () => <LongListDemo />,
};

interface LazyDemoNode {
  id: string;
  label: string;
  childrenCount?: number;
  children?: LazyDemoNode[];
}

const lazyCollection = createTreeCollection<LazyDemoNode>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.label,
  rootNode: {
    id: "ROOT",
    label: "",
    children: [
      { id: "engineering", label: "Engineering", childrenCount: 3 },
      { id: "design", label: "Design", childrenCount: 2 },
      { id: "sales", label: "Sales", childrenCount: 4 },
    ],
  },
});

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

const loadTeam = async ({
  node,
  valuePath,
  signal,
}: TreeViewLoadChildrenDetails<LazyDemoNode>): Promise<LazyDemoNode[]> => {
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
  const [teams, setTeams] = useState(lazyCollection);
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Box
      maxW="400px"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
    >
      <TreeSelectList
        collection={teams}
        value={selected}
        onValueChange={setSelected}
        loadChildren={loadTeam}
        onLoadChildrenComplete={(details) => setTeams(details.collection)}
        listHeight="320px"
      />
    </Box>
  );
}

export const LazyLoading: Story = {
  render: () => <LazyLoadingDemo />,
};

const searchServer = async (query: string, signal: AbortSignal) => {
  await delay(400, signal);
  const normalized = query.trim().toLowerCase();
  if (!normalized) return collection;
  return collection.filter((node) => node.label.toLowerCase().includes(normalized));
};

function ExternalSearchDemo() {
  const { query, debouncedQuery, setQuery } = useDebounceQuery("", 300);
  const [results, setResults] = useState(collection);
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
        collection={results}
        value={selected}
        onValueChange={setSelected}
        search={{ mode: "external", query, onQueryChange: setQuery }}
        listHeight="320px"
      />
    </Box>
  );
}

export const ExternalSearch: Story = {
  render: () => <ExternalSearchDemo />,
};
