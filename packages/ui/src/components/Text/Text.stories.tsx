import type { Meta, StoryObj } from "@storybook/react-vite";

import { Text } from ".";
import { Box, VStack } from "../Layout";

const meta: Meta<typeof Text> = {
  title: "Components/Text",
  component: Text,
  tags: ["autodocs"],
  args: {
    children: "The quick brown fox jumps over the lazy dog.",
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <VStack gap="2">
      <Text textStyle="xs">Extra Small</Text>
      <Text textStyle="sm">Small</Text>
      <Text textStyle="md">Medium</Text>
      <Text textStyle="lg">Large</Text>
      <Text textStyle="xl">Extra Large</Text>
    </VStack>
  ),
};

export const TruncatedTextStory: Story = {
  name: "TruncatedText",
  render: () => (
    <Box maxW="200px">
      <Text truncate>
        This is a very long text that will be truncated with an ellipsis when it overflows the
        container.
      </Text>
    </Box>
  ),
};
