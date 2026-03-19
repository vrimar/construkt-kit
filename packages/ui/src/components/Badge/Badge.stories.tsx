import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from ".";

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
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      <Badge variant="solid">Solid</Badge>
      <Badge variant="surface">Surface</Badge>
      <Badge variant="subtle">Subtle</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <Badge size="xs">XSmall</Badge>
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};
