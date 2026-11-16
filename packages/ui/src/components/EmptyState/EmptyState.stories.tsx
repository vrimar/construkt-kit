import preview from "@construkt-kit/story-kit/preview";

import { emptyState } from "#styled-system/recipes";

import { EmptyState } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Box } from "../Layout";

const meta = preview.meta({
  title: "Components/EmptyState",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Box maxW="400px">
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Title>No results found</EmptyState.Title>
          <EmptyState.Description>
            Try adjusting your search criteria or creating a new item.
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
    </Box>
  ),
});

export const WithIndicator = meta.story({
  render: () => (
    <Box maxW="400px">
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>📭</EmptyState.Indicator>
          <EmptyState.Title>Your inbox is empty</EmptyState.Title>
          <EmptyState.Description>
            New messages will appear here when you receive them.
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
    </Box>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={emptyState.variantMap.size}
      renderPreview={(size) => (
        <EmptyState.Root size={size}>
          <EmptyState.Content>
            <EmptyState.Indicator>📭</EmptyState.Indicator>
            <EmptyState.Title>No results ({size})</EmptyState.Title>
            <EmptyState.Description>Try adjusting your filters.</EmptyState.Description>
          </EmptyState.Content>
        </EmptyState.Root>
      )}
    />
  ),
});
