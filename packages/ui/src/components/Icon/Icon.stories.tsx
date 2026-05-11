import { icon } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { StarIcon } from "lucide-react";

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
      <Icon fontSize="xl">⭐</Icon>
      <Icon fontSize="2xl">🔥</Icon>
      <Icon fontSize="3xl">🎉</Icon>
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
