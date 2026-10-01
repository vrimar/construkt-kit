import type { Meta, StoryObj } from "@storybook/react-vite";

import { input } from "#styled-system/recipes";

import { PasswordInput } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

const meta: Meta<typeof PasswordInput> = {
  title: "Components/Input/PasswordInput",
  component: PasswordInput,
  tags: ["autodocs"],
  args: {
    placeholder: "Enter password",
  },
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <SizePreviewTable
      sizes={input.variantMap.size}
      renderPreview={(size) => (
        <PasswordInput
          size={size}
          placeholder={`Password (${size})`}
        />
      )}
    />
  ),
};
