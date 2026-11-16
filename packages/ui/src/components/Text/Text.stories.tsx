import preview from "@construkt-kit/story-kit/preview";

import { Text } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Box } from "../Layout";

const textSizes = ["xs", "sm", "md", "lg", "xl"] as const;
type TextSize = (typeof textSizes)[number];

const meta = preview.meta({
  title: "Components/Text",
  component: Text,
  tags: ["autodocs"],
  args: {
    children: "The quick brown fox jumps over the lazy dog.",
  },
});

export const Default = meta.story();

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable<TextSize>
      sizes={[...textSizes]}
      label="Text sizes"
      renderPreview={(size) => (
        <Text textStyle={size}>The quick brown fox jumps over the lazy dog.</Text>
      )}
    />
  ),
});

export const TruncatedTextStory = meta.story({
  name: "TruncatedText",
  render: () => (
    <Box maxW="200px">
      <Text truncate>
        This is a very long text that will be truncated with an ellipsis when it overflows the
        container.
      </Text>
    </Box>
  ),
});
