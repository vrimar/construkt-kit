import { input } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { VStack } from "../Layout";

const meta: Meta<typeof Input> = {
  title: "Components/Input/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "Enter text...",
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <SizePreviewTable
      sizes={input.variantMap.size}
      renderPreview={(size) => (
        <Input
          size={size}
          placeholder={size}
        />
      )}
    />
  ),
};

export const Variants: Story = {
  render: () => (
    <VStack
      gap="2"
      maxW="400px"
    >
      <Input
        variant="outline"
        placeholder="Outline"
      />
      <Input
        variant="subtle"
        placeholder="Subtle"
      />
    </VStack>
  ),
};
