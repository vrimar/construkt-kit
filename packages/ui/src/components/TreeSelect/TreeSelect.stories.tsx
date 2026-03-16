import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { TreeSelectList, type TreeSelectGroup } from "./TreeSelectList";

const meta: Meta = {
  title: "Components/TreeSelect",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

interface Item {
  id: number;
  name: string;
}

const groups: TreeSelectGroup<Item>[] = [
  {
    id: "fruits",
    name: "Fruits",
    children: [
      { id: 1, name: "Apple" },
      { id: 2, name: "Banana" },
      { id: 3, name: "Cherry" },
    ],
  },
  {
    id: "vegetables",
    name: "Vegetables",
    children: [
      { id: 4, name: "Carrot" },
      { id: 5, name: "Broccoli" },
      { id: 6, name: "Spinach" },
    ],
  },
];

function TreeSelectDemo() {
  const [selected, setSelected] = useState<(string | number)[]>([1, 4]);

  return (
    <div style={{ maxWidth: 400, border: "1px solid #ccc", borderRadius: 8 }}>
      <TreeSelectList
        groups={groups}
        selected={selected}
        onSelectedChange={setSelected}
        getId={(item) => item.id}
        getLabel={(item) => item.name}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <TreeSelectDemo />,
};
