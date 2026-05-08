import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from ".";
import { HStack, Wrap } from "../Layout";

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

export const Variants: Story = {
  render: () => (
    <Wrap gap="4">
      <Checkbox
        variant="solid"
        defaultChecked
      >
        Solid
      </Checkbox>
      <Checkbox
        variant="surface"
        defaultChecked
      >
        Surface
      </Checkbox>
      <Checkbox
        variant="subtle"
        defaultChecked
      >
        Subtle
      </Checkbox>
      <Checkbox
        variant="outline"
        defaultChecked
      >
        Outline
      </Checkbox>
      <Checkbox
        variant="plain"
        defaultChecked
      >
        Plain
      </Checkbox>
    </Wrap>
  ),
};

export const Indeterminate: Story = {
  args: {
    children: "Indeterminate",
    checked: "indeterminate",
  },
};
