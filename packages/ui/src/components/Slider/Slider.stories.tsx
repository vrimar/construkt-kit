import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from ".";

const meta: Meta<typeof Slider> = {
  title: "Components/Slider",
  component: Slider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: {
    defaultValue: [50],
    min: 0,
    max: 100,
    width: "300px",
  },
};

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    min: 0,
    max: 100,
    width: "300px",
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: 300 }}>
      <Slider
        defaultValue={[30]}
        size="sm"
      />
      <Slider
        defaultValue={[50]}
        size="md"
      />
      <Slider
        defaultValue={[70]}
        size="lg"
      />
    </div>
  ),
};
