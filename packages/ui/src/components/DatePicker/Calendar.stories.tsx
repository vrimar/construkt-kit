import preview from "@construkt-kit/story-kit/preview";
import { parseDate } from "@internationalized/date";
import { useState } from "react";
import { fn } from "storybook/test";

import { Calendar, defaultRangePresets } from ".";
import { Input } from "../Input";
import { Box, Stack } from "../Layout";

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

/** A range whose two months straddle a new year. */
export const RangeAcrossNewYear = meta.story({
  render: () => (
    <Box>
      <Calendar
        selectionMode="range"
        defaultValue={[parseDate("2029-12-10"), parseDate("2029-12-12")]}
        onValueChange={fn()}
      />
    </Box>
  ),
});

/** The month view, its selected month marked. */
export const MonthView = meta.story({
  render: () => (
    <Box maxW="320px">
      <Calendar
        defaultView="month"
        defaultValue={parseDate("2026-03-11")}
        onValueChange={fn()}
      />
    </Box>
  ),
});

function ControlledDemo() {
  const [notes, setNotes] = useState("");
  return (
    <Stack
      gap="3"
      maxW="320px"
    >
      <Input
        aria-label="Notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      <Calendar
        clearable
        value={parseDate("2026-03-11")}
        onValueChange={fn()}
      />
    </Stack>
  );
}

/** A calendar whose owner keeps its value, beside a field that re-renders the owner. */
export const Controlled = meta.story({
  render: () => <ControlledDemo />,
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
