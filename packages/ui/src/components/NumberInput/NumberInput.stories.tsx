import type { Meta, StoryObj } from "@storybook/react-vite";

import { NumberInput } from ".";
import { VStack } from "../Layout";

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
    <VStack
      gap="3"
      p="4"
      maxW="320px"
    >
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <NumberInput
          key={size}
          defaultValue="10"
          min={0}
          max={100}
          size={size}
        >
          <NumberInput.Label>{size}</NumberInput.Label>
          <NumberInput.Field />
          <NumberInput.Control />
        </NumberInput>
      ))}
    </VStack>
  ),
};
