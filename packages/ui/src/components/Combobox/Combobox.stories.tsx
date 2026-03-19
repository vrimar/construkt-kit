import type { Meta, StoryObj } from "@storybook/react-vite";
import { Combobox, createListCollection } from ".";

const meta: Meta = {
  title: "Components/Combobox",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const items = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" },
  { label: "Solid", value: "solid" },
];

const collection = createListCollection({ items });

export const Default: Story = {
  render: () => (
    <Combobox.Root collection={collection}>
      <Combobox.Label>Framework</Combobox.Label>
      <Combobox.Control>
        <Combobox.Input placeholder="Select a framework" />
        <Combobox.Trigger>▼</Combobox.Trigger>
        <Combobox.ClearTrigger>✕</Combobox.ClearTrigger>
      </Combobox.Control>
      <Combobox.Positioner>
        <Combobox.Content>
          <Combobox.List>
            {collection.items.map((item) => (
              <Combobox.Item
                key={item.value}
                item={item}
              >
                {item.label}
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  ),
};
