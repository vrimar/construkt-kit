import { radioGroup } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Radio, RadioGroup } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

const meta: Meta<typeof Radio> = {
  title: "Components/Radio",
  component: Radio,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-1">
      <Radio value="option-1">Option 1</Radio>
      <Radio value="option-2">Option 2</Radio>
      <Radio value="option-3">Option 3</Radio>
    </RadioGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <SizePreviewTable
      sizes={radioGroup.variantMap.size}
      renderPreview={(size) => (
        <RadioGroup
          defaultValue="a"
          size={size}
        >
          <Radio value="a">{size}</Radio>
        </RadioGroup>
      )}
    />
  ),
};
