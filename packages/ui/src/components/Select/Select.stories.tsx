import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Select } from "./Select";

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
    <Select.Root
      items={items}
      selected={undefined}
      getValue={(item) => item.id}
      getLabel={(item) => item.name}
      onSelect={fn<(item: (typeof items)[number]) => void>()}
    >
      <Select.Trigger label="Select a fruit" />
      <Select.Content>
        <Select.Search />
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
  ),
};

export const WithSelected: Story = {
  render: () => (
    <Select.Root
      items={items}
      selected={2}
      getValue={(item) => item.id}
      getLabel={(item) => item.name}
      onSelect={fn<(item: (typeof items)[number]) => void>()}
    >
      <Select.Trigger />
      <Select.Content>
        <Select.Search />
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
  ),
};

export const MultiSelect: Story = {
  render: () => (
    <Select.Root
      items={items}
      selected={[1, 3]}
      getValue={(item) => item.id}
      getLabel={(item) => item.name}
      onSelect={fn<(item: (typeof items)[number]) => void>()}
    >
      <Select.Trigger label="Select fruits" />
      <Select.Content>
        <Select.Search />
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
  ),
};

export const Compound: Story = {
  render: () => (
    <Select.Root
      items={items}
      selected={[1, 3]}
      getValue={(item) => item.id}
      getLabel={(item) => item.name}
      onSelect={fn<(item: (typeof items)[number]) => void>()}
    >
      <Select.Trigger label="Select fruits" />
      <Select.Content width="320px">
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
  ),
};
