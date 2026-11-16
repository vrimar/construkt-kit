import preview from "@construkt-kit/story-kit/preview";

import { input } from "#styled-system/recipes";

import { SearchInput } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Box } from "../Layout";

const meta = preview.meta({
  title: "Components/Input/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  args: {
    placeholder: "Search...",
  },
});

export const Default = meta.story({
  render: () => (
    <Box maxW="400px">
      <SearchInput placeholder="Search..." />
    </Box>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={input.variantMap.size}
      renderPreview={(size) => (
        <SearchInput
          size={size}
          value={`Query ${size}`}
          onChange={() => {}}
          onClear={() => {}}
          placeholder={`Search (${size})`}
        />
      )}
    />
  ),
});
