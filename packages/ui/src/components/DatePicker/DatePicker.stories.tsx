import preview from "@construkt-kit/story-kit/preview";
import { fn } from "storybook/test";

import { DatePicker, DatePickerSelect, defaultRangePresets, parseDate } from ".";
import { Button } from "../Buttons";
import { Box } from "../Layout";

const meta = preview.meta({
  title: "Components/DatePicker",
  tags: ["autodocs"],
});

export const Single = meta.story({
  render: () => (
    <Box maxW="320px">
      <DatePicker onValueChange={fn()} />
    </Box>
  ),
});

export const Range = meta.story({
  render: () => (
    <Box maxW="320px">
      <DatePicker
        selectionMode="range"
        presets={defaultRangePresets}
        clearable
        onValueChange={fn()}
      />
    </Box>
  ),
});

export const CustomTrigger = meta.story({
  name: "Custom Trigger",
  render: () => (
    <Box maxW="320px">
      <DatePicker
        trigger={<Button variant="outline">Pick a date</Button>}
        onValueChange={fn()}
      />
    </Box>
  ),
});

export const NotPortalled = meta.story({
  name: "Not Portalled",
  render: () => (
    <Box maxW="320px">
      <DatePicker
        portalled={false}
        onValueChange={fn()}
      />
    </Box>
  ),
});

export const Open = meta.story({
  tags: ["open-state"],
  // The phone sheet traps focus, so the trigger behind its aria-hidden page is unreachable.
  parameters: { a11y: { config: { rules: [{ id: "aria-hidden-focus", enabled: false }] } } },
  render: () => (
    <Box maxW="320px">
      <DatePicker
        defaultOpen
        defaultValue={parseDate("2026-03-12")}
        onValueChange={fn()}
      />
    </Box>
  ),
});

// --- DatePickerSelect ---

export const Select = meta.story({
  name: "DatePickerSelect / Range",
  render: () => (
    <Box maxW="320px">
      <DatePickerSelect
        selectionMode="range"
        value={[]}
        onValueChange={fn()}
      />
    </Box>
  ),
});

export const SelectPhone = meta.story({
  ...Select.input,
  name: "DatePickerSelect / Phone",
  tags: ["phone-only"],
  globals: { viewport: { value: "mobile1", isRotated: false } },
});
