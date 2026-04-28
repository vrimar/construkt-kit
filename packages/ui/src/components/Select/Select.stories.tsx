import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoreHorizontalIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
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

type Fruit = (typeof items)[number];

const getValue = (item: Fruit) => item.id;
const getLabel = (item: Fruit) => item.name;
const onSelect = fn<(item: Fruit) => void>();

interface ControlledSingleSelectStoryProps {
  initialSelected?: number;
  emptySelectionLabel?: string;
  searchPlaceholder?: string;
  renderActions?: (item: Fruit) => ReactNode;
}

interface ControlledMultiSelectStoryProps {
  initialSelected: number[];
  emptySelectionLabel?: string;
  searchPlaceholder?: string;
}

function ControlledSingleSelectStory({
  initialSelected,
  emptySelectionLabel,
  renderActions,
  searchPlaceholder,
}: ControlledSingleSelectStoryProps) {
  const [selected, setSelected] = useState<number | undefined>(initialSelected);

  const handleSelect = (item: Fruit) => {
    onSelect(item);
    setSelected(getValue(item));
  };

  return (
    <Box maxW="320px">
      <Select
        items={items}
        selected={selected}
        getValue={getValue}
        getLabel={getLabel}
        onSelect={handleSelect}
        emptySelectionLabel={emptySelectionLabel}
        searchPlaceholder={searchPlaceholder}
        renderActions={renderActions}
      />
    </Box>
  );
}

function ControlledMultiSelectStory({
  initialSelected,
  emptySelectionLabel,
  searchPlaceholder,
}: ControlledMultiSelectStoryProps) {
  const [selected, setSelected] = useState<number[]>(initialSelected);

  const handleSelect = (item: Fruit) => {
    onSelect(item);
    setSelected((previous) => {
      const value = getValue(item);

      return previous.includes(value)
        ? previous.filter((entry) => entry !== value)
        : [...previous, value];
    });
  };

  return (
    <Box maxW="320px">
      <Select
        items={items}
        selected={selected}
        getValue={getValue}
        getLabel={getLabel}
        onSelect={handleSelect}
        emptySelectionLabel={emptySelectionLabel}
        searchPlaceholder={searchPlaceholder}
      />
    </Box>
  );
}

function ControlledCompoundStory() {
  const [selected, setSelected] = useState<number[]>([1, 3]);

  const handleSelect = (item: Fruit) => {
    onSelect(item);
    setSelected((previous) => {
      const value = getValue(item);

      return previous.includes(value)
        ? previous.filter((entry) => entry !== value)
        : [...previous, value];
    });
  };

  return (
    <Box maxW="320px">
      <Select.Root
        items={items}
        selected={selected}
        getValue={getValue}
        getLabel={getLabel}
        onSelect={handleSelect}
      >
        <Select.Trigger />
        <Select.Content>
          <Select.Search placeholder="Search fruits..." />
          <Select.List>
            <Select.Items>
              {(item: Fruit) => (
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
  );
}

// --- Simple API ---

export const Default: Story = {
  render: () => <ControlledSingleSelectStory />,
};

export const WithSearch: Story = {
  render: () => (
    <ControlledSingleSelectStory
      emptySelectionLabel="Select fruit"
      searchPlaceholder="Search fruits..."
    />
  ),
};

export const WithSelected: Story = {
  render: () => <ControlledSingleSelectStory initialSelected={2} />,
};

export const MultiSelect: Story = {
  render: () => (
    <ControlledMultiSelectStory
      initialSelected={[1, 3]}
      searchPlaceholder="Search..."
    />
  ),
};

export const WithActions: Story = {
  render: () => (
    <ControlledSingleSelectStory
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
  ),
};

// --- Compound API ---

export const Compound: Story = {
  render: () => <ControlledCompoundStory />,
};
