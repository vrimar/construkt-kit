import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { TagSelect } from ".";
import { Box } from "../Layout";

const colors = [
  { id: 1, name: "Red" },
  { id: 2, name: "Green" },
  { id: 3, name: "Blue" },
  { id: 4, name: "Yellow" },
];

const meta: Meta = {
  title: "Components/TagSelect",
  component: TagSelect,
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
    const [value, setValue] = useState<number[]>([1]);
    return (
      <TagSelect
        items={colors}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        placeholder="Pick colors"
      />
    );
  },
};

export const Phone: Story = {
  ...Default,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
