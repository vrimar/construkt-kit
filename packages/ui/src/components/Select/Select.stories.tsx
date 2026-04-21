import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoreHorizontalIcon } from "lucide-react";
import { fn } from "storybook/test";

import { Select } from ".";
import { Box } from "../Layout";

const meta: Meta = {
  title: "Components/Select",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const items = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
  { id: 4, name: "Date" },
  { id: 5, name: "Elderberry" },
];

const getValue = (item: (typeof items)[number]) => item.id;
const getLabel = (item: (typeof items)[number]) => item.name;
const onSelect = fn<(item: (typeof items)[number]) => void>();

// --- Simple API ---

export const Default: Story = {
  render: () => (
    <Box maxW="320px">
      <Select
        items={items}
        selected={undefined}
        getValue={getValue}
        getLabel={getLabel}
        onSelect={onSelect}
        label="Select a fruit"
      />
    </Box>
  ),
};

export const WithSearch: Story = {
  render: () => (
    <Box maxW="320px">
      <Select
        items={items}
        selected={undefined}
        getValue={getValue}
        getLabel={getLabel}
        onSelect={onSelect}
        label="Select a fruit"
        searchPlaceholder="Search fruits..."
      />
    </Box>
  ),
};

export const WithSelected: Story = {
  render: () => (
    <Box maxW="320px">
      <Select
        items={items}
        selected={2}
        getValue={getValue}
        getLabel={getLabel}
        onSelect={onSelect}
      />
    </Box>
  ),
};

export const MultiSelect: Story = {
  render: () => (
    <Box maxW="320px">
      <Select
        items={items}
        selected={[1, 3]}
        getValue={getValue}
        getLabel={getLabel}
        onSelect={onSelect}
        label="Select fruits"
        searchPlaceholder="Search..."
      />
    </Box>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Box maxW="320px">
      <Select
        items={items}
        selected={undefined}
        getValue={getValue}
        getLabel={getLabel}
        onSelect={onSelect}
        label="Select a fruit"
        renderActions={(item) => (
          <button
            type="button"
            aria-label={`Edit ${item.name}`}
            onClick={() => alert(`Edit ${item.name}`)}
          >
            <MoreHorizontalIcon size={14} />
          </button>
        )}
      />
    </Box>
  ),
};

// --- Compound API ---

export const Compound: Story = {
  render: () => (
    <Box maxW="320px">
      <Select.Root
        items={items}
        selected={[1, 3]}
        getValue={getValue}
        getLabel={getLabel}
        onSelect={onSelect}
      >
        <Select.Trigger label="Select fruits" />
        <Select.Content>
          <Select.Search placeholder="Search fruits..." />
          <Select.List>
            <Select.Items>
              {(item: (typeof items)[number]) => (
                <Select.Item
                  key={item.id}
                  item={item}
                >
                  <Select.ItemText />
                  <Select.ItemIndicator />
                </Select.Item>
              )}
            </Select.Items>
            <Select.EmptyState />
          </Select.List>
        </Select.Content>
      </Select.Root>
    </Box>
  ),
};
