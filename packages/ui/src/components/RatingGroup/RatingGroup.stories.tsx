import preview from "@construkt-kit/story-kit/preview";

import { ratingGroup } from "#styled-system/recipes";

import { RatingGroup } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

const meta = preview.meta({
  title: "Components/RatingGroup",
  tags: ["autodocs"],
});

export const Default = meta.story({
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
});

export const ReadOnly = meta.story({
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
});

export const Sizes = meta.story({
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
});
