import type { Meta, StoryObj } from "@storybook/react-vite";

import { ToggleGroup } from ".";
import { VStack } from "../Layout";

const meta: Meta = {
  title: "Components/ToggleGroup",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ToggleGroup.Root defaultValue={["bold"]}>
      <ToggleGroup.Item
        value="bold"
        aria-label="Bold"
      >
        <strong>B</strong>
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="italic"
        aria-label="Italic"
      >
        <em>I</em>
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value="underline"
        aria-label="Underline"
      >
        <u>U</u>
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  ),
};

export const Single: Story = {
  render: () => (
    <ToggleGroup.Root
      defaultValue={["left"]}
      multiple={false}
    >
      <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
      <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
      <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
    </ToggleGroup.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <VStack gap="4">
      {(["A", "B", "C"] as const).map((label) => (
        <ToggleGroup.Root
          key={label}
          defaultValue={["a"]}
        >
          <ToggleGroup.Item value="a">{label}</ToggleGroup.Item>
          <ToggleGroup.Item value="b">B</ToggleGroup.Item>
          <ToggleGroup.Item value="c">C</ToggleGroup.Item>
        </ToggleGroup.Root>
      ))}
    </VStack>
  ),
};
