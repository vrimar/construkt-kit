import type { Meta, StoryObj } from "@storybook/react-vite";

import { RatingGroup } from ".";
import { VStack } from "../Layout";

const meta: Meta = {
  title: "Components/RatingGroup",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <RatingGroup.Root
      count={5}
      defaultValue={3}
    >
      <RatingGroup.Label>Rating</RatingGroup.Label>
      <RatingGroup.Control />
      <RatingGroup.HiddenInput />
    </RatingGroup.Root>
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <RatingGroup.Root
      count={5}
      defaultValue={4}
      readOnly
    >
      <RatingGroup.Label>Customer Rating</RatingGroup.Label>
      <RatingGroup.Control />
    </RatingGroup.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <VStack gap="4">
      <RatingGroup.Root
        count={5}
        defaultValue={3}
        size="sm"
      >
        <RatingGroup.Label>Small</RatingGroup.Label>
        <RatingGroup.Control />
      </RatingGroup.Root>
      <RatingGroup.Root
        count={5}
        defaultValue={3}
        size="md"
      >
        <RatingGroup.Label>Medium</RatingGroup.Label>
        <RatingGroup.Control />
      </RatingGroup.Root>
      <RatingGroup.Root
        count={5}
        defaultValue={3}
        size="lg"
      >
        <RatingGroup.Label>Large</RatingGroup.Label>
        <RatingGroup.Control />
      </RatingGroup.Root>
    </VStack>
  ),
};
