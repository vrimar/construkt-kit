import type { Meta, StoryObj } from "@storybook/react-vite";

import { Code } from ".";
import { HStack, Wrap } from "../Layout";

const meta: Meta<typeof Code> = {
  title: "Components/Code",
  component: Code,
  tags: ["autodocs"],
  args: {
    children: "console.log('hello')",
  },
};

export default meta;
type Story = StoryObj<typeof Code>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <Wrap gap="2">
      <Code variant="solid">solid</Code>
      <Code variant="surface">surface</Code>
      <Code variant="subtle">subtle</Code>
      <Code variant="outline">outline</Code>
      <Code variant="plain">plain</Code>
    </Wrap>
  ),
};

export const Sizes: Story = {
  render: () => (
    <HStack gap="2">
      <Code size="xs">xs</Code>
      <Code size="sm">sm</Code>
      <Code size="md">md</Code>
      <Code size="lg">lg</Code>
    </HStack>
  ),
};
