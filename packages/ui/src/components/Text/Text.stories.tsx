import type { Meta, StoryObj } from "@storybook/react-vite";

import { Text } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Box } from "../Layout";

const textSizes = ["xs", "sm", "md", "lg", "xl"] as const;
type TextSize = (typeof textSizes)[number];

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
    <SizePreviewTable<TextSize>
      sizes={[...textSizes]}
      renderPreview={(size) => (
        <Text textStyle={size}>The quick brown fox jumps over the lazy dog.</Text>
      )}
    />
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
