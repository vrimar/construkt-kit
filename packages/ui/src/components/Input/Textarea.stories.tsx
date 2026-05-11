import { textarea } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

const meta: Meta<typeof Textarea> = {
  title: "Components/Input/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: {
    placeholder: "Enter long text...",
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <SizePreviewTable
      sizes={textarea.variantMap.size}
      renderPreview={(size) => (
        <Textarea
          size={size}
          placeholder={`Long-form text (${size})`}
        />
      )}
    />
  ),
};
