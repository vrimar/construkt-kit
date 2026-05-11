import { button } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { SelectButton } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { VStack } from "../Layout";

const meta: Meta<typeof SelectButton> = {
  title: "Components/Buttons/SelectButton",
  component: SelectButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SelectButton>;

export const Default: Story = {
  render: () => (
    <VStack
      gap="2"
      maxW="300px"
    >
      <SelectButton
        label="Select an option"
        hasValue={false}
      />
      <SelectButton
        label="Selected value"
        hasValue
        onClear={() => {}}
      />
    </VStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <SizePreviewTable
      sizes={button.variantMap.size}
      renderPreview={(size) => (
        <SelectButton
          size={size}
          label={`Selected value (${size})`}
          hasValue
          onClear={() => {}}
        />
      )}
    />
  ),
};
