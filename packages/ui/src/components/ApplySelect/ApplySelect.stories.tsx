import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ApplySelect } from ".";
import { Box } from "../Layout";

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
    <Box maxW="320px">
      <ApplySelect.Root
        items={items}
        selected={[]}
        getValue={(item) => item.id}
        getLabel={(item) => item.name}
        onApply={fn<(values: (typeof items)[number][]) => void>()}
      >
        <ApplySelect.Trigger label="Select Frameworks" />
        <ApplySelect.Content>
          <ApplySelect.Search />
          <ApplySelect.List>
            <ApplySelect.Items>
              {(item: (typeof items)[number]) => (
                <ApplySelect.Item
                  key={item.id}
                  item={item}
                >
                  <ApplySelect.ItemText />
                  <ApplySelect.ItemIndicator />
                </ApplySelect.Item>
              )}
            </ApplySelect.Items>
            <ApplySelect.EmptyState />
          </ApplySelect.List>
          <ApplySelect.Actions />
        </ApplySelect.Content>
      </ApplySelect.Root>
    </Box>
  ),
};

export const WithToggleAll: Story = {
  render: () => (
    <Box maxW="320px">
      <ApplySelect.Root
        items={items}
        selected={[1, 3]}
        getValue={(item) => item.id}
        getLabel={(item) => item.name}
        onApply={fn<(values: (typeof items)[number][]) => void>()}
      >
        <ApplySelect.Trigger label="Select All" />
        <ApplySelect.Content>
          <ApplySelect.Search />
          <ApplySelect.List>
            <ApplySelect.Items>
              {(item: (typeof items)[number]) => (
                <ApplySelect.Item
                  key={item.id}
                  item={item}
                >
                  <ApplySelect.ItemText />
                  <ApplySelect.ItemIndicator />
                </ApplySelect.Item>
              )}
            </ApplySelect.Items>
            <ApplySelect.EmptyState />
          </ApplySelect.List>
          <ApplySelect.Actions hasToggleAll />
        </ApplySelect.Content>
      </ApplySelect.Root>
    </Box>
  ),
};
