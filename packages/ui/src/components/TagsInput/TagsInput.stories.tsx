import type { Meta, StoryObj } from "@storybook/react-vite";

import { TagsInput } from ".";
import { VStack } from "../Layout";

const meta: Meta = {
  title: "Components/TagsInput",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <TagsInput.Root
      defaultValue={["React", "Vue"]}
      maxW="400px"
    >
      <TagsInput.Label>Tags</TagsInput.Label>
      <TagsInput.Control>
        <TagsInput.Items />
        <TagsInput.Input placeholder="Add tag..." />
        <TagsInput.ClearTrigger />
      </TagsInput.Control>
      <TagsInput.HiddenInput />
    </TagsInput.Root>
  ),
};

export const Empty: Story = {
  render: () => (
    <TagsInput.Root maxW="400px">
      <TagsInput.Label>Keywords</TagsInput.Label>
      <TagsInput.Control>
        <TagsInput.Items />
        <TagsInput.Input placeholder="Type and press Enter..." />
      </TagsInput.Control>
      <TagsInput.HiddenInput />
    </TagsInput.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <VStack
      gap="4"
      p="4"
      maxW="400px"
    >
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <TagsInput.Root
          key={size}
          defaultValue={["React", "Vue"]}
          size={size}
        >
          <TagsInput.Label>{size}</TagsInput.Label>
          <TagsInput.Control>
            <TagsInput.Items />
            <TagsInput.Input placeholder="Add tag..." />
          </TagsInput.Control>
          <TagsInput.HiddenInput />
        </TagsInput.Root>
      ))}
    </VStack>
  ),
};
