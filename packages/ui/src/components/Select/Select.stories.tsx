import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Select } from "./Select";
import { SelectList } from "./SelectList";

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

export const Default: Story = {
  render: () => (
    <Select
      items={items}
      selected={undefined}
      getValue={(item) => item.id}
      getLabel={(item) => item.name}
      onSelect={fn()}
      triggerProps={{ label: "Select a fruit" }}
    />
  ),
};

export const WithSelected: Story = {
  render: () => (
    <Select
      items={items}
      selected={2}
      getValue={(item) => item.id}
      getLabel={(item) => item.name}
      onSelect={fn()}
    />
  ),
};

export const MultiSelect: Story = {
  render: () => (
    <Select
      items={items}
      selected={[1, 3]}
      getValue={(item) => item.id}
      getLabel={(item) => item.name}
      onSelect={fn()}
      triggerProps={{ label: "Select fruits" }}
    />
  ),
};

export const SelectListStory: Story = {
  name: "SelectList",
  render: () => (
    <div style={{ maxWidth: 300, border: "1px solid #ccc", borderRadius: 8 }}>
      <SelectList
        items={items}
        selected={undefined}
        getValue={(item) => item.id}
        getLabel={(item) => item.name}
        onSelect={fn()}
      />
    </div>
  ),
};
