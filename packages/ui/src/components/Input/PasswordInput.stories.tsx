import preview from "@construkt-kit/story-kit/preview";

import { input } from "#styled-system/recipes";

import { PasswordInput } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

const meta = preview.meta({
  title: "Components/Input/PasswordInput",
  component: PasswordInput,
  tags: ["autodocs"],
  args: {
    placeholder: "Enter password",
  },
});

export const Default = meta.story();

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={input.variantMap.size}
      renderPreview={(size) => (
        <PasswordInput
          size={size}
          placeholder={`Password (${size})`}
        />
      )}
    />
  ),
});
