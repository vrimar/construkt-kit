import { numberInput } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { NumberInput } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

const meta: Meta<typeof NumberInput> = {
  title: "Components/NumberInput",
  component: NumberInput,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {
  render: () => (
    <NumberInput
      defaultValue="10"
      min={0}
      max={100}
    >
      <NumberInput.Label>Quantity</NumberInput.Label>
      <NumberInput.Field />
      <NumberInput.Control />
    </NumberInput>
  ),
};

export const WithMinMax: Story = {
  render: () => (
    <NumberInput
      defaultValue="5"
      min={0}
      max={10}
      step={1}
    >
      <NumberInput.Label>Rating (0-10)</NumberInput.Label>
      <NumberInput.Field />
      <NumberInput.Control />
    </NumberInput>
  ),
};

export const Sizes: Story = {
  render: () => (
    <SizePreviewTable
      sizes={numberInput.variantMap.size}
      renderPreview={(size) => (
        <NumberInput
          defaultValue="10"
          min={0}
          max={100}
          size={size}
        >
          <NumberInput.Field />
          <NumberInput.Control />
        </NumberInput>
      )}
    />
  ),
};
