import type { Meta, StoryObj } from "@storybook/react-vite";

import { SelectButton } from ".";
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
    <VStack
      gap="2"
      maxW="300px"
    >
      {(["sm", "md", "lg"] as const).map((size) => (
        <SelectButton
          key={size}
          size={size}
          label={`Selected value (${size})`}
          hasValue
          onClear={() => {}}
        />
      ))}
    </VStack>
  ),
};
