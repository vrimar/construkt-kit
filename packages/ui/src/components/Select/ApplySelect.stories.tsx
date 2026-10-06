import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ApplySelect } from ".";
import { Box } from "../Layout";

const frameworks = [
  { id: 1, name: "React" },
  { id: 2, name: "Vue" },
  { id: 3, name: "Angular" },
  { id: 4, name: "Svelte" },
];

const meta: Meta = {
  title: "Components/ApplySelect",
  component: ApplySelect,
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
    const [value, setValue] = useState<number[]>([]);
    return (
      <ApplySelect
        items={frameworks}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        placeholder="Select frameworks"
        actions={{ toggleAll: true }}
      />
    );
  },
};

export const CustomRendering: Story = {
  render: function CustomRenderingStory() {
    const [value, setValue] = useState<number[]>([1]);
    return (
      <ApplySelect
        items={frameworks}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        renderItem={(item, state) => (
          <span>
            {item.name} {state.selected ? "✓" : ""}
          </span>
        )}
        search={{ placeholder: "Find framework" }}
      />
    );
  },
};

export const Compound: Story = {
  render: function CompoundStory() {
    const [value, setValue] = useState<number[]>([]);
    return (
      <ApplySelect.Root
        items={frameworks}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        search
      >
        <ApplySelect.Trigger />
        <ApplySelect.Content>
          <ApplySelect.Search />
          <ApplySelect.List />
          <ApplySelect.Actions toggleAll />
        </ApplySelect.Content>
      </ApplySelect.Root>
    );
  },
};
