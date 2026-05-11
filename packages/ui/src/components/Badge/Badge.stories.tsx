import { badge } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Wrap } from "../Layout";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: {
    children: "Badge",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <Wrap gap="2">
      <Badge variant="solid">Solid</Badge>
      <Badge variant="surface">Surface</Badge>
      <Badge variant="subtle">Subtle</Badge>
      <Badge variant="outline">Outline</Badge>
    </Wrap>
  ),
};

export const Sizes: Story = {
  render: () => (
    <SizePreviewTable
      sizes={badge.variantMap.size}
      renderPreview={(size) => <Badge size={size}>{size}</Badge>}
    />
  ),
};
