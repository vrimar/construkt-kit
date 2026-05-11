import { ratingGroup } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { RatingGroup } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

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
    <SizePreviewTable
      sizes={ratingGroup.variantMap.size}
      renderPreview={(size) => (
        <RatingGroup.Root
          count={5}
          defaultValue={3}
          size={size}
        >
          <RatingGroup.Label>{size}</RatingGroup.Label>
          <RatingGroup.Control />
          <RatingGroup.HiddenInput />
        </RatingGroup.Root>
      )}
    />
  ),
};
