import { spinner } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Spinner } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

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
    <SizePreviewTable
      sizes={spinner.variantMap.size}
      renderPreview={(size) => <Spinner size={size} />}
    />
  ),
};

export const WithColor: Story = {
  args: {
    color: "brand.fg",
    size: "lg",
  },
};
