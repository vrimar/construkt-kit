import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar } from ".";
import { HStack } from "../Layout";

const meta: Meta = {
  title: "Components/Avatar",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const WithImage: Story = {
  render: () => (
    <Avatar.Root>
      <Avatar.Fallback name="John Doe" />
      <Avatar.Image
        src="https://i.pravatar.cc/150?u=a"
        alt="John Doe"
      />
    </Avatar.Root>
  ),
};

export const WithInitials: Story = {
  render: () => (
    <Avatar.Root>
      <Avatar.Fallback name="Jane Smith" />
    </Avatar.Root>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <Avatar.Root>
      <Avatar.Fallback />
    </Avatar.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <HStack gap="2">
      {(["xs", "sm", "md", "lg", "xl", "2xl"] as const).map((size) => (
        <Avatar.Root
          key={size}
          size={size}
        >
          <Avatar.Fallback name="John Doe" />
        </Avatar.Root>
      ))}
    </HStack>
  ),
};
