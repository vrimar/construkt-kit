import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { TreeSelectList, createTreeCollection } from ".";
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
      borderColor="border.default"
      borderRadius="lg"
    >
      <TreeSelectList
        collection={collection}
        value={selected}
        onValueChange={setSelected}
        maxHeight="320px"
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
      borderColor="border.default"
      borderRadius="lg"
    >
      <TreeSelectList
        collection={collection}
        value={selected}
        onValueChange={setSelected}
        showSearch={false}
        showSelectAll={false}
        maxHeight="320px"
      />
    </Box>
  );
}

export const WithoutToolbar: Story = {
  render: () => <BareTreeDemo />,
};

function SmallSizeDemo() {
  const [selected, setSelected] = useState<string[]>(["carrot"]);

  return (
    <Box
      maxW="400px"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
    >
      <TreeSelectList
        collection={collection}
        value={selected}
        onValueChange={setSelected}
        size="sm"
        maxHeight="320px"
      />
    </Box>
  );
}

export const SmallSize: Story = {
  render: () => <SmallSizeDemo />,
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
        maxHeight="480px"
      />
    </Box>
  );
}

export const LongList: Story = {
  render: () => <LongListDemo />,
};
