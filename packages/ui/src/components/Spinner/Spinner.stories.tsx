import preview from "@construkt-kit/story-kit/preview";

import { spinner } from "#styled-system/recipes";

import { Spinner } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Text } from "../Text";

const meta = preview.meta({
  title: "Components/Spinner",
  component: Spinner,
  tags: ["autodocs"],
});

export const Default = meta.story();

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={spinner.variantMap.size}
      renderPreview={(size) => <Spinner size={size} />}
    />
  ),
});

export const WithColor = meta.story({
  args: {
    color: "brand.fg",
    size: "lg",
  },
});

export const Dots = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={spinner.variantMap.size}
      renderPreview={(size) => (
        <Text color="fg.muted">
          Drafting
          <Spinner
            variant="dots"
            size={size}
            ms="1"
          />
        </Text>
      )}
    />
  ),
});
