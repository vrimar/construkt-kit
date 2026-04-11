import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { DatePicker, DatePickerSelect, defaultRangePresets } from ".";
import { Button } from "../Buttons";

const meta: Meta = {
  title: "Components/DatePicker",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Single: Story = {
  render: () => <DatePicker onValueChange={fn()} />,
};

export const Range: Story = {
  render: () => (
    <DatePicker
      selectionMode="range"
      presets={defaultRangePresets}
      clearable
      onValueChange={fn()}
    />
  ),
};

export const CustomTrigger: Story = {
  name: "Custom Trigger",
  render: () => (
    <DatePicker
      trigger={<Button variant="outline">Pick a date</Button>}
      onValueChange={fn()}
    />
  ),
};

export const NotPortalled: Story = {
  name: "Not Portalled",
  render: () => (
    <DatePicker
      portalled={false}
      onValueChange={fn()}
    />
  ),
};

// --- DatePickerSelect ---

export const Select: Story = {
  name: "DatePickerSelect / Range",
  render: () => (
    <DatePickerSelect
      selectionMode="range"
      value={[]}
      onValueChange={fn()}
    />
  ),
};
