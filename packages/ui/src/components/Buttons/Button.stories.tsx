import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from ".";
import { HStack, Wrap } from "../Layout";

const meta: Meta<typeof Button> = {
  title: "Components/Buttons/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Button",
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true },
};

export const LoadingWithText: Story = {
  args: { loading: true, loadingText: "Saving…" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Variants: Story = {
  render: () => (
    <Wrap gap="2">
      <Button variant="solid">Solid</Button>
      <Button variant="surface">Surface</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="plain">Plain</Button>
    </Wrap>
  ),
};

export const Sizes: Story = {
  render: () => (
    <HStack gap="2">
      <Button size="xs">XSmall</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </HStack>
  ),
};
