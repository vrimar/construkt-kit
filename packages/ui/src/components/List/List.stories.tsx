import type { Meta, StoryObj } from "@storybook/react-vite";

import { List } from ".";
import { Box } from "../Layout";

const meta: Meta = {
  title: "Components/List",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Box maxW="320px">
      <List.Root>
        <List.Item>First item</List.Item>
        <List.Item>Second item</List.Item>
        <List.Item>Third item</List.Item>
      </List.Root>
    </Box>
  ),
};
