import preview from "@construkt-kit/story-kit/preview";

import { spinner } from "#styled-system/recipes";

import { LoadingOverlay } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Box } from "../Layout";

const meta = preview.meta({
  title: "Components/LoadingOverlay",
  component: LoadingOverlay,
  tags: ["autodocs"],
  decorators: [
    (Story: any) => (
      <Box
        w="full"
        maxW="400px"
        h="200px"
      >
        <Story />
      </Box>
    ),
  ],
});

export const Active = meta.story({
  args: {
    loading: true,
    relative: true,
  },
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={spinner.variantMap.size}
      renderPreview={(size) => (
        <Box
          w="120px"
          h="80px"
          position="relative"
          borderWidth="1px"
          borderColor="border"
          borderRadius="md"
          overflow="hidden"
        >
          <LoadingOverlay
            loading
            relative
            minHeight="80px"
            size={size}
            tip="Loading..."
          />
        </Box>
      )}
    />
  ),
});

export const WithCustomTip = meta.story({
  args: {
    loading: true,
    relative: true,
    tip: "Fetching data...",
  },
});

export const Inactive = meta.story({
  args: {
    loading: false,
    relative: true,
  },
});
