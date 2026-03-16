import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColorPicker } from ".";

const meta: Meta = {
  title: "Components/ColorPicker",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <ColorPicker />,
};

export const WithSwatches: Story = {
  render: () => (
    <ColorPicker
      swatches={["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"]}
    />
  ),
};

export const WithAlpha: Story = {
  render: () => <ColorPicker withAlpha />,
};
