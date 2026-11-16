import preview from "@construkt-kit/story-kit/preview";
import { useState } from "react";

import { Select } from ".";
import { Box } from "../Layout";

const fruits = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
];

const produce = [
  { id: 1, name: "Apple", kind: "Fruit" },
  { id: 2, name: "Carrot", kind: "Vegetable" },
  { id: 3, name: "Banana", kind: "Fruit" },
  { id: 4, name: "Spinach", kind: "Vegetable" },
];

const meta = preview.meta({
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
});

export const Default = meta.story({
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
});

export const Searchable = meta.story({
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
});

export const Multiple = meta.story({
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
});

export const Grouped = meta.story({
  render: function GroupedStory() {
    const [value, setValue] = useState<number | null>(null);
    return (
      <Select
        items={produce}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={(item) => item.kind}
        groupSort="asc"
        renderGroupLabel={(group, groupItems) => `${group} (${groupItems.length})`}
        value={value}
        onValueChange={setValue}
        placeholder="Select produce"
        search
      />
    );
  },
});

export const Compound = meta.story({
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
});

export const Phone = meta.story({
  ...Searchable.input,
  tags: ["phone-only"],
  globals: { viewport: { value: "mobile1", isRotated: false } },
});

export const Open = meta.story({
  tags: ["open-state"],
  render: function OpenStory() {
    const [value, setValue] = useState<number | null>(3);
    return (
      <Select
        defaultOpen
        items={produce}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={(item) => item.kind}
        groupSort="asc"
        value={value}
        onValueChange={setValue}
        placeholder="Select produce"
      />
    );
  },
});
