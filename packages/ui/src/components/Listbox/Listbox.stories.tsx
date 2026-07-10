import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Listbox } from ".";
import { HStack } from "../Layout";

const items = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
  { id: 4, name: "Dragon fruit" },
];

const meta: Meta = {
  title: "Components/Listbox",
  component: Listbox,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: function DefaultStory() {
    const [value, setValue] = useState<number | null>(null);
    return (
      <Listbox
        items={items}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        maxW="64"
      />
    );
  },
};

export const Multiple: Story = {
  render: function MultipleStory() {
    const [value, setValue] = useState<number[]>([1]);
    return (
      <Listbox
        items={items}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        selectionMode="multiple"
        value={value}
        onValueChange={setValue}
        maxW="64"
      />
    );
  },
};

export const CustomRendering: Story = {
  render: () => (
    <Listbox
      items={items}
      getItemValue={(item) => item.id}
      getItemLabel={(item) => item.name}
      value={1}
      onValueChange={() => {}}
      renderItem={(item, state) => `${item.name}${state.selected ? " (selected)" : ""}`}
      renderItemActions={(item) => <button type="button">Edit {item.name}</button>}
      maxW="64"
    />
  ),
};

export const IndicatorPositions: Story = {
  render: () => (
    <HStack alignItems="flex-start">
      {(["start", "end", "none"] as const).map((indicatorPosition) => (
        <Listbox
          key={indicatorPosition}
          items={items}
          getItemValue={(item) => item.id}
          getItemLabel={(item) => item.name}
          value={1}
          onValueChange={() => {}}
          label={indicatorPosition}
          indicatorPosition={indicatorPosition}
          search={false}
          maxW="56"
        />
      ))}
    </HStack>
  ),
};

export const Virtualized: Story = {
  render: function VirtualizedStory() {
    const manyItems = Array.from({ length: 1_000 }, (_, index) => ({
      id: index,
      name: `Item ${index}`,
    }));
    const [value, setValue] = useState<number | null>(null);
    return (
      <Listbox
        items={manyItems}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        virtual
        maxW="64"
      />
    );
  },
};
