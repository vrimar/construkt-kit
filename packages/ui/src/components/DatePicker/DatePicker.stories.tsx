import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { DatePicker, DatePickerSelect, RangeDatePicker } from ".";
import { Button } from "../Buttons";

const meta: Meta = {
  title: "Components/DatePicker",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <DatePicker onValueChange={fn()} />,
};

export const RangePicker: Story = {
  render: () => (
    <RangeDatePicker
      trigger={<Button variant="outline">Select date range</Button>}
      value={[]}
      onValueChange={fn()}
    />
  ),
};

export const PickerSelect: Story = {
  render: () => (
    <DatePickerSelect
      value={[]}
      onValueChange={fn()}
    />
  ),
};
