import preview from "@construkt-kit/story-kit/preview";

import { radioGroup } from "#styled-system/recipes";

import { Radio, RadioGroup } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

const meta = preview.meta({
  title: "Components/Radio",
  component: Radio,
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <RadioGroup defaultValue="option-1">
      <Radio value="option-1">Option 1</Radio>
      <Radio value="option-2">Option 2</Radio>
      <Radio value="option-3">Option 3</Radio>
    </RadioGroup>
  ),
});

export const Sizes = meta.story({
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
});
