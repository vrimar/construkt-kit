import type { Meta, StoryObj } from "@storybook/react-vite";

import { ColorPicker } from ".";
import { Box } from "../Layout";

const meta: Meta = {
  title: "Components/ColorPicker",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Box maxW="320px">
      <ColorPicker />
    </Box>
  ),
};

export const WithSwatches: Story = {
  render: () => (
    <Box maxW="320px">
      <ColorPicker
        swatches={["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"]}
      />
    </Box>
  ),
};

export const WithAlpha: Story = {
  render: () => (
    <Box maxW="320px">
      <ColorPicker withAlpha />
    </Box>
  ),
};
