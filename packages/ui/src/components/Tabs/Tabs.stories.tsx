import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tabs } from ".";
import { Box, VStack } from "../Layout";

const meta: Meta = {
  title: "Components/Tabs",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Box maxW="400px">
      <Tabs.Root defaultValue="tab-1">
        <Tabs.List>
          <Tabs.Trigger value="tab-1">Overview</Tabs.Trigger>
          <Tabs.Trigger value="tab-2">Settings</Tabs.Trigger>
          <Tabs.Trigger value="tab-3">Billing</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Content value="tab-1">Overview content goes here.</Tabs.Content>
        <Tabs.Content value="tab-2">Settings content goes here.</Tabs.Content>
        <Tabs.Content value="tab-3">Billing content goes here.</Tabs.Content>
      </Tabs.Root>
    </Box>
  ),
};

export const Variants: Story = {
  render: () => (
    <VStack gap="6">
      {(["line", "subtle", "enclosed"] as const).map((variant) => (
        <Tabs.Root
          key={variant}
          defaultValue="a"
          variant={variant}
        >
          <Tabs.List>
            <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
            <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
          <Tabs.Content value="a">Variant: {variant}</Tabs.Content>
          <Tabs.Content value="b">Second tab</Tabs.Content>
        </Tabs.Root>
      ))}
    </VStack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <VStack gap="6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Tabs.Root
          key={size}
          defaultValue="a"
          size={size}
        >
          <Tabs.List>
            <Tabs.Trigger value="a">Size {size}</Tabs.Trigger>
            <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
          <Tabs.Content value="a">Content</Tabs.Content>
          <Tabs.Content value="b">Content</Tabs.Content>
        </Tabs.Root>
      ))}
    </VStack>
  ),
};
