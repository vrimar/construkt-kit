import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton, SkeletonCircle, SkeletonText } from ".";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: 400 }}>
      <Skeleton height="20px" />
      <Skeleton height="20px" />
      <Skeleton
        height="20px"
        width="80%"
      />
    </div>
  ),
};

export const Circle: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <SkeletonCircle size="10" />
      <SkeletonCircle size="14" />
      <SkeletonCircle size="20" />
    </div>
  ),
};

export const Text: Story = {
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <SkeletonText noOfLines={4} />
    </div>
  ),
};

export const CardLoading: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", maxWidth: 400 }}>
      <SkeletonCircle size="10" />
      <div style={{ flex: 1 }}>
        <SkeletonText noOfLines={3} />
      </div>
    </div>
  ),
};
