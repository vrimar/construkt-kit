import type { Meta, StoryObj } from "@storybook/react-vite";

import { Radio, RadioGroup } from ".";
import { HStack } from "../Layout";

const meta: Meta<typeof Radio> = {
  title: "Components/Radio",
  component: Radio,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1">
      <Radio value="option-1">Option 1</Radio>
      <Radio value="option-2">Option 2</Radio>
      <Radio value="option-3">Option 3</Radio>
    </RadioGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <HStack gap="6">
      <RadioGroup
        defaultValue="a"
        size="sm"
      >
        <Radio value="a">Small</Radio>
      </RadioGroup>
      <RadioGroup
        defaultValue="a"
        size="md"
      >
        <Radio value="a">Medium</Radio>
      </RadioGroup>
      <RadioGroup
        defaultValue="a"
        size="lg"
      >
        <Radio value="a">Large</Radio>
      </RadioGroup>
    </HStack>
  ),
};
