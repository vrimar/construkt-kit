import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Calendar, defaultRangePresets } from ".";

const meta: Meta = {
  title: "Components/Calendar",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Single: Story = {
  render: () => <Calendar onValueChange={fn()} />,
};

export const Range: Story = {
  render: () => (
    <Calendar
      selectionMode="range"
      onValueChange={fn()}
    />
  ),
};

export const RangeWithPresets: Story = {
  name: "Range + Presets",
  render: () => (
    <Calendar
      selectionMode="range"
      presets={defaultRangePresets}
      clearable
      onValueChange={fn()}
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <Calendar
      disabled
      onValueChange={fn()}
    />
  ),
};
