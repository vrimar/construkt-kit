import preview from "@construkt-kit/story-kit/preview";

import { ColorPicker } from ".";
import { Box } from "../Layout";

const meta = preview.meta({
  title: "Components/ColorPicker",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Box maxW="320px">
      <ColorPicker />
    </Box>
  ),
});

export const WithSwatches = meta.story({
  render: () => (
    <Box maxW="320px">
      <ColorPicker
        swatches={["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"]}
      />
    </Box>
  ),
});

export const WithAlpha = meta.story({
  render: () => (
    <Box maxW="320px">
      <ColorPicker withAlpha />
    </Box>
  ),
});

export const Phone = meta.story({
  ...WithSwatches.input,
  tags: ["phone-only"],
  globals: { viewport: { value: "mobile1", isRotated: false } },
});

export const Open = meta.story({
  tags: ["open-state"],
  render: () => (
    <Box maxW="320px">
      <ColorPicker
        defaultOpen
        withAlpha
      />
    </Box>
  ),
});
