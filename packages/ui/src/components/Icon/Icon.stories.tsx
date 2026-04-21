import type { Meta, StoryObj } from "@storybook/react-vite";
import { StarIcon } from "lucide-react";

import { Icon } from ".";
import { HStack } from "../Layout";

const meta: Meta<typeof Icon> = {
  title: "Components/Icon",
  component: Icon,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  render: () => (
    <HStack gap="4">
      <Icon fontSize="xl">⭐</Icon>
      <Icon fontSize="2xl">🔥</Icon>
      <Icon fontSize="3xl">🎉</Icon>
    </HStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <HStack
      gap="4"
      p="4"
    >
      {(["2xs", "xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Icon
          key={size}
          size={size}
        >
          <StarIcon />
        </Icon>
      ))}
    </HStack>
  ),
};
