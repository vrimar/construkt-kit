import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "./Text";
import { TextLabel } from "./TextLabel";

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
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Text textStyle="xs">Extra Small</Text>
      <Text textStyle="sm">Small</Text>
      <Text textStyle="md">Medium</Text>
      <Text textStyle="lg">Large</Text>
      <Text textStyle="xl">Extra Large</Text>
    </div>
  ),
};

export const TextLabelStory: Story = {
  name: "TextLabel",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <TextLabel>Label text</TextLabel>
      <Text>Regular text below the label</Text>
    </div>
  ),
};

export const TruncatedTextStory: Story = {
  name: "TruncatedText",
  render: () => (
    <div style={{ maxWidth: 200 }}>
      <Text truncate>
        This is a very long text that will be truncated with an ellipsis when it overflows the
        container.
      </Text>
    </div>
  ),
};
