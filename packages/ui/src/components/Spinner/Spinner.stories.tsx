import type { Meta, StoryObj } from "@storybook/react-vite";

import { Spinner } from ".";
import { HStack } from "../Layout";

const meta: Meta<typeof Spinner> = {
  title: "Components/Spinner",
  component: Spinner,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <HStack gap="4">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </HStack>
  ),
};

export const WithColor: Story = {
  args: {
    color: "brand.fg",
    size: "lg",
  },
};
