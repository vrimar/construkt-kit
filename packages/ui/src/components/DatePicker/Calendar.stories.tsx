import preview from "@construkt-kit/story-kit/preview";
import { fn } from "storybook/test";

import { Calendar, defaultRangePresets } from ".";
import { Box } from "../Layout";

const meta = preview.meta({
  title: "Components/Calendar",
  tags: ["autodocs"],
});

export const Single = meta.story({
  render: () => (
    <Box maxW="320px">
      <Calendar onValueChange={fn()} />
    </Box>
  ),
});

export const Range = meta.story({
  render: () => (
    <Box>
      <Calendar
        selectionMode="range"
        onValueChange={fn()}
      />
    </Box>
  ),
});

export const RangeWithPresets = meta.story({
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
});

export const Disabled = meta.story({
  render: () => (
    <Box maxW="320px">
      <Calendar
        disabled
        onValueChange={fn()}
      />
    </Box>
  ),
});
