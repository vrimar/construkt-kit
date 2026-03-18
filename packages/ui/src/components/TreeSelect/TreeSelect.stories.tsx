import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { createTreeCollection } from "../Tree";
import { TreeSelect } from "./TreeSelect";

const meta: Meta = {
  title: "Components/TreeSelect",
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

function TreeSelectDemo() {
  const [selected, setSelected] = useState<string[]>(["apple", "lemon"]);

  return (
    <div style={{ maxWidth: 400, border: "1px solid #ccc", borderRadius: 8 }}>
      <TreeSelect
        collection={collection}
        value={selected}
        onValueChange={setSelected}
        maxHeight="320px"
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <TreeSelectDemo />,
};
