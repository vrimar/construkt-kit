import type { Meta, StoryObj } from "@storybook/react-vite";

import { Kbd } from ".";
import { Box, HStack } from "../Layout";

const meta: Meta<typeof Kbd> = {
  title: "Components/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  args: {
    children: "⌘",
  },
};

export default meta;
type Story = StoryObj<typeof Kbd>;

export const Default: Story = {};

export const Combinations: Story = {
  render: () => (
    <HStack gap="2">
      <Kbd>⌘</Kbd>+<Kbd>C</Kbd>
      <Box
        as="span"
        ml="4"
      >
        <Kbd>Ctrl</Kbd>+<Kbd>Shift</Kbd>+<Kbd>P</Kbd>
      </Box>
    </HStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <HStack gap="2">
      <Kbd size="sm">sm</Kbd>
      <Kbd size="md">md</Kbd>
      <Kbd size="lg">lg</Kbd>
    </HStack>
  ),
};
