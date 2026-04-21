import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { DatePicker, DatePickerSelect, defaultRangePresets } from ".";
import { Button } from "../Buttons";
import { Box } from "../Layout";

const meta: Meta = {
  title: "Components/DatePicker",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Single: Story = {
  render: () => (
    <Box maxW="320px">
      <DatePicker onValueChange={fn()} />
    </Box>
  ),
};

export const Range: Story = {
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
};

export const CustomTrigger: Story = {
  name: "Custom Trigger",
  render: () => (
    <Box maxW="320px">
      <DatePicker
        trigger={<Button variant="outline">Pick a date</Button>}
        onValueChange={fn()}
      />
    </Box>
  ),
};

export const NotPortalled: Story = {
  name: "Not Portalled",
  render: () => (
    <Box maxW="320px">
      <DatePicker
        portalled={false}
        onValueChange={fn()}
      />
    </Box>
  ),
};

// --- DatePickerSelect ---

export const Select: Story = {
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
};
