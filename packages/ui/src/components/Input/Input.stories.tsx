import preview from "@construkt-kit/story-kit/preview";

import { input } from "#styled-system/recipes";

import { Input } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { VStack } from "../Layout";

const meta = preview.meta({
  title: "Components/Input/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "Enter text...",
  },
});

export const Default = meta.story();

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={input.variantMap.size}
      renderPreview={(size) => (
        <Input
          size={size}
          placeholder={size}
        />
      )}
    />
  ),
});

export const Variants = meta.story({
  render: () => (
    <VStack
      gap="2"
      maxW="400px"
    >
      <Input
        variant="outline"
        placeholder="Outline"
      />
      <Input
        variant="subtle"
        placeholder="Subtle"
      />
    </VStack>
  ),
});
