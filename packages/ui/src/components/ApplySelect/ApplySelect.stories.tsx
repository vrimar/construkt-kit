import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ApplySelect } from ".";

const meta: Meta = {
  title: "Components/ApplySelect",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const items = [
  { id: 1, name: "React" },
  { id: 2, name: "Vue" },
  { id: 3, name: "Angular" },
  { id: 4, name: "Svelte" },
  { id: 5, name: "Solid" },
];

export const Default: Story = {
  render: () => (
    <ApplySelect
      items={items}
      selected={[]}
      getValue={(item) => item.id}
      getLabel={(item) => item.name}
      onApply={fn()}
      triggerProps={{ label: "Select Frameworks" }}
    />
  ),
};

export const WithToggleAll: Story = {
  render: () => (
    <ApplySelect
      items={items}
      selected={[1, 3]}
      getValue={(item) => item.id}
      getLabel={(item) => item.name}
      onApply={fn()}
      hasToggleAll
      triggerProps={{ label: "Select All" }}
    />
  ),
};
