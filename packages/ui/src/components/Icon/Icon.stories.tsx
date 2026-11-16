import type { Meta, StoryObj } from "@storybook/react-vite";
import { FlameIcon, PartyPopperIcon, StarIcon } from "lucide-react";

import { icon } from "#styled-system/recipes";

import { Icon } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
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
      <Icon color="yellow.solid.bg">
        <StarIcon />
      </Icon>
      <Icon color="orange.solid.bg">
        <FlameIcon />
      </Icon>
      <Icon color="purple.solid.bg">
        <PartyPopperIcon />
      </Icon>
    </HStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <SizePreviewTable
      sizes={icon.variantMap.size}
      renderPreview={(size) => (
        <Icon size={size}>
          <StarIcon />
        </Icon>
      )}
    />
  ),
};
