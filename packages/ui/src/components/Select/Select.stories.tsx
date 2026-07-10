import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Select } from ".";
import { Box } from "../Layout";

const fruits = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
];

const meta: Meta = {
  title: "Components/Select",
  component: Select,
  decorators: [
    (Story) => (
      <Box
        w="full"
        maxW="320px"
      >
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: function DefaultStory() {
    const [value, setValue] = useState<number | null>(null);
    return (
      <Select
        items={fruits}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        placeholder="Select fruit"
      />
    );
  },
};

export const Searchable: Story = {
  render: function SearchableStory() {
    const [value, setValue] = useState<number | null>(null);
    return (
      <Select
        items={fruits}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        placeholder="Select fruit"
        search={{ placeholder: "Search fruits...", autoFocus: true }}
      />
    );
  },
};

export const Multiple: Story = {
  render: function MultipleStory() {
    const [value, setValue] = useState<number[]>([]);
    return (
      <Select
        items={fruits}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        selectionMode="multiple"
        value={value}
        onValueChange={setValue}
        placeholder="Select fruits"
        search
      />
    );
  },
};

export const Compound: Story = {
  render: function CompoundStory() {
    const [value, setValue] = useState<number | null>(null);
    return (
      <Select.Root
        items={fruits}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        renderItem={(item) => <strong>{item.name}</strong>}
        search
      >
        <Select.Trigger buttonProps={{ label: "Custom select" }} />
        <Select.Content>
          <Select.Search />
          <Select.List />
          <Select.Footer p="2">Choose one fruit</Select.Footer>
        </Select.Content>
      </Select.Root>
    );
  },
};
