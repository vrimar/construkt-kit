import preview from "@construkt-kit/story-kit/preview";
import { fn } from "storybook/test";

import { numberInput } from "#styled-system/recipes";

import { NumberInput } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

const meta = preview.meta({
  title: "Components/NumberInput",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <NumberInput.Root
      defaultValue="10"
      min={0}
      max={100}
    >
      <NumberInput.Label>Quantity</NumberInput.Label>
      <NumberInput.Input />
      <NumberInput.Control />
    </NumberInput.Root>
  ),
});

export const WithMinMax = meta.story({
  args: { onFocusChange: fn(), onValueCommit: fn() },
  render: ({ onFocusChange, onValueCommit }) => (
    <NumberInput.Root
      defaultValue="5"
      min={0}
      max={10}
      step={1}
      onFocusChange={onFocusChange}
      onValueCommit={onValueCommit}
    >
      <NumberInput.Label>Rating (0-10)</NumberInput.Label>
      <NumberInput.Input />
      <NumberInput.Control />
    </NumberInput.Root>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={numberInput.variantMap.size}
      renderPreview={(size) => (
        <NumberInput.Root
          defaultValue="10"
          min={0}
          max={100}
          size={size}
        >
          <NumberInput.Label>Quantity</NumberInput.Label>
          <NumberInput.Input />
          <NumberInput.Control />
        </NumberInput.Root>
      )}
    />
  ),
});
