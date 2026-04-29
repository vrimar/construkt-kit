import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Calendar, defaultRangePresets } from ".";
import { Box } from "../Layout";

const meta: Meta = {
  title: "Components/Calendar",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Single: Story = {
  render: () => (
    <Box maxW="320px">
      <Calendar onValueChange={fn()} />
    </Box>
  ),
};

export const Range: Story = {
  render: () => (
    <Box>
      <Calendar
        selectionMode="range"
        onValueChange={fn()}
      />
    </Box>
  ),
};

export const RangeWithPresets: Story = {
  name: "Range + Presets",
  render: () => (
    <Box>
      <Calendar
        selectionMode="range"
        presets={defaultRangePresets}
        clearable
        onValueChange={fn()}
      />
    </Box>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Box maxW="320px">
      <Calendar
        disabled
        onValueChange={fn()}
      />
    </Box>
  ),
};
