import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from ".";
import { HStack } from "../Layout";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    children: "Accept terms",
  },
};

export const Checked: Story = {
  args: {
    children: "I agree",
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled option",
    disabled: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <HStack gap="4">
      <Checkbox size="sm">Small</Checkbox>
      <Checkbox size="md">Medium</Checkbox>
      <Checkbox size="lg">Large</Checkbox>
    </HStack>
  ),
};
