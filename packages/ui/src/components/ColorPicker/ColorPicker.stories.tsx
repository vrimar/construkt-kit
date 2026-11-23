import preview from "@construkt-kit/story-kit/preview";

import { ColorPicker } from ".";
import { Box } from "../Layout";

const meta = preview.meta({
  title: "Components/ColorPicker",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Box maxW="320px">
        <Story />
      </Box>
    ),
  ],
});

export const Default = meta.story({
  render: () => <ColorPicker />,
});

export const WithSwatches = meta.story({
  render: () => (
    <ColorPicker
      swatches={["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"]}
    />
  ),
});

export const WithAlpha = meta.story({
  render: () => <ColorPicker withAlpha />,
});

export const Phone = meta.story({
  ...WithSwatches.input,
  tags: ["phone-only"],
  globals: { viewport: { value: "mobile1", isRotated: false } },
});

export const Open = meta.story({
  tags: ["open-state"],
  render: () => (
    <ColorPicker
      defaultOpen
      withAlpha
    />
  ),
});
