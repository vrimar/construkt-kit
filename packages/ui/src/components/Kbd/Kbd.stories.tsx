import preview from "@construkt-kit/story-kit/preview";

import { kbd } from "#styled-system/recipes";

import { Kbd } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Box, HStack } from "../Layout";

const meta = preview.meta({
  title: "Components/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  args: {
    children: "⌘",
  },
});

export const Default = meta.story();

export const Combinations = meta.story({
  render: () => (
    <HStack gap="2">
      <Kbd>⌘</Kbd>+<Kbd>C</Kbd>
      <Box
        as="span"
        ml="4"
      >
        <Kbd>Ctrl</Kbd>+<Kbd>Shift</Kbd>+<Kbd>P</Kbd>
      </Box>
    </HStack>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={kbd.variantMap.size}
      renderPreview={(size) => <Kbd size={size}>{size}</Kbd>}
    />
  ),
});
