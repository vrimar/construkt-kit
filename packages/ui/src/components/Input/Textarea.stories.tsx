import preview from "@construkt-kit/story-kit/preview";

import { textarea } from "#styled-system/recipes";

import { Textarea } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

const meta = preview.meta({
  title: "Components/Input/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: {
    placeholder: "Enter long text...",
  },
});

export const Default = meta.story();

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={textarea.variantMap.size}
      renderPreview={(size) => (
        <Textarea
          size={size}
          placeholder={`Long-form text (${size})`}
        />
      )}
    />
  ),
});
