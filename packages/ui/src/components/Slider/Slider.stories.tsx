import { slider } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Slider } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

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
    <SizePreviewTable
      sizes={slider.variantMap.size}
      renderPreview={(size) => (
        <Slider
          defaultValue={[50]}
          size={size}
          width="200px"
        />
      )}
    />
  ),
};
