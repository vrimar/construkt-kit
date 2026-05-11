import { avatar } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

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
    <SizePreviewTable
      sizes={avatar.variantMap.size}
      renderPreview={(size) => (
        <Avatar.Root size={size}>
          <Avatar.Fallback name="John Doe" />
        </Avatar.Root>
      )}
    />
  ),
};
